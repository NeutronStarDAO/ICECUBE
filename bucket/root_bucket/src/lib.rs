use candid::{CandidType, Deserialize, Encode, Principal};
use std::borrow::Borrow;
use std::collections::HashMap;
use std::cell::{RefCell, Cell};
use std::result;
use ic_cdk::api::management_canister::main::{
    create_canister, CreateCanisterArgument, CanisterSettings,
    install_code, InstallCodeArgument, CanisterInstallMode
};
use ic_cdk::api::management_canister::main::{CanisterStatusResponse, CanisterIdRecord};
use types::Post;

const T_CYCLES: u128 = 1_000_000_000_000;

thread_local! {
    static BUCKET_INDEX: Cell<u64> = Cell::new(0);
    static BUCKET_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
    static AVAILABLE_BUCKET_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
    static UNAVAILABLE_BUCKET_MAP: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());

    static BUCKET_WASM: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    static BUCKET_WASM_BUFFER: RefCell<Vec<u8>> = RefCell::new(Vec::new());

    static COMMENT_FETCH_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
    static LIKE_FETCH_ACTOR: RefCell<Principal> = RefCell::new(Principal::anonymous());
}

#[ic_cdk::update]
fn init_fetch_actor(
    comment_fetch: Principal,
    like_fetch: Principal
) {
    COMMENT_FETCH_ACTOR.set(comment_fetch);
    LIKE_FETCH_ACTOR.set(like_fetch)
}

#[ic_cdk::update]
async fn init() {
    for _ in 0..5 {
        let canister_record = create_canister(
            CreateCanisterArgument {
                settings: Some(CanisterSettings {
                    controllers: Some(vec![ic_cdk::id()]),
                    compute_allocation: None,
                    memory_allocation: None,
                    freezing_threshold: None,
                    reserved_cycles_limit: None,
                    wasm_memory_limit: None
                })
            }, 
            4 * T_CYCLES
        ).await.unwrap();
        let canister_id = canister_record.0.canister_id;

        install_code(InstallCodeArgument {
            mode: CanisterInstallMode::Install,
            canister_id: canister_id,
            wasm_module: BUCKET_WASM.with(|wasm| wasm.borrow().clone()),
            arg: Encode!(
                &COMMENT_FETCH_ACTOR.with(|comment_fetch| comment_fetch.borrow().clone()),
                &LIKE_FETCH_ACTOR.with(|like_fetch| like_fetch.borrow().clone())
            ).unwrap()
        }).await.unwrap();

        BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(),
                canister_id
            )
        });
        AVAILABLE_BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(), 
                canister_id
            )
        });
        BUCKET_INDEX.set(BUCKET_INDEX.get() + 1);
    }
}

#[ic_cdk::update]
fn update_bucket_wasm(wasm_chunk: Vec<u8>, index: u64) -> bool {
    if index == 0 {
        BUCKET_WASM_BUFFER.set(wasm_chunk);
        true
    } else if index == 1 {
        let mut new_wasm = BUCKET_WASM_BUFFER.with(|wasm_buffer| wasm_buffer.borrow().clone());
        new_wasm.extend(wasm_chunk);
        BUCKET_WASM.set(new_wasm);
        true
    } else {
        false
    }
}

#[ic_cdk::query]
fn get_bucket_wasm() -> Vec<u8> {
    BUCKET_WASM.with(|wasm| wasm.borrow().clone())
}

#[ic_cdk::update]
fn add_available_bucket(bucket_array: Vec<Principal>) {
    for bucket in bucket_array {
        BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(), 
                bucket
            )
        });
        AVAILABLE_BUCKET_MAP.with(|map| {
            map.borrow_mut().insert(
                BUCKET_INDEX.get(), 
                bucket
            )
        });
        BUCKET_INDEX.set(BUCKET_INDEX.get() + 1);
    }
}

#[ic_cdk::query]
fn get_bucket_index() -> u64 {
    BUCKET_INDEX.get()
}

#[ic_cdk::update]
async fn create_bucket() -> Principal {
    _create_bucket().await
}

#[ic_cdk::update]
fn re_create_bucket() {
    AVAILABLE_BUCKET_MAP.with(|map| {
        for (index, bucket) in map.borrow().iter() {
            if bucket == &ic_cdk::caller() {
                _create_bucket();
                map.borrow_mut().remove(&index);
                UNAVAILABLE_BUCKET_MAP.with(|unavailable_map| {
                    unavailable_map.borrow_mut().insert(
                        *index, 
                        *bucket
                    )
                });
            }
        }
    })
}

#[ic_cdk::query]
fn get_availeable_bucket() -> Option<Principal> {
    AVAILABLE_BUCKET_MAP.with(|map| {
        let size = map.borrow().len() as u64;
        if size == 0 {
            return None;
        }
        map.borrow().get(&(ic_cdk::api::time() % size)).cloned()
    })
} 

#[ic_cdk::query]
fn get_all_bucket() -> Vec<Principal> {
    BUCKET_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_all_available_bucket() -> Vec<Principal> {
    AVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_all_unavailable_bucket() -> Vec<Principal> {
    UNAVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    })
}

#[ic_cdk::update]
async fn status() -> CanisterStatusResponse {
    ic_cdk::api::management_canister::main::canister_status(CanisterIdRecord {
        canister_id: ic_cdk::api::id()
    }).await.unwrap().0
}

#[ic_cdk::query(composite = true)]
async fn get_buckets_latest_feed(n: u64) -> Vec<Post> {
    let mut posts: Vec<Post> = Vec::new();
    let mut m = n;
    let buckets: Vec<Principal> = AVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow().values().cloned().collect()
    });
    for bucket in buckets {
        let result = ic_cdk::call::<(u64, ), (Vec<Post>, )>(
            bucket, 
            "get_latest_feed", 
            (m,)
        ).await.unwrap().0;
        if result.len() > 0 {
            let len = result.len() as u64;
            for post in result {
                posts.push(post);
            };
            if len < m {
                m -= len;
            } else {
                m = 0;
                break;
            }
        }
    }
    posts
}

async fn _create_bucket() -> Principal {
    let canister_record = create_canister(
        CreateCanisterArgument {
            settings: Some(CanisterSettings {
                controllers: Some(vec![ic_cdk::id()]),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None
            })
        }, 
        4 * T_CYCLES
    ).await.unwrap();
    let canister_id = canister_record.0.canister_id;

    install_code(InstallCodeArgument {
        mode: CanisterInstallMode::Install,
        canister_id: canister_id,
        wasm_module: BUCKET_WASM.with(|wasm| wasm.borrow().clone()),
        arg: vec![]
    }).await.unwrap();

    BUCKET_MAP.with(|map| {
        map.borrow_mut().insert(
            BUCKET_INDEX.get(),
            canister_id
        )
    });
    AVAILABLE_BUCKET_MAP.with(|map| {
        map.borrow_mut().insert(
            BUCKET_INDEX.get(), 
            canister_id
        )
    });
    BUCKET_INDEX.set(BUCKET_INDEX.get() + 1);   

    canister_id
}

ic_cdk::export_candid!();