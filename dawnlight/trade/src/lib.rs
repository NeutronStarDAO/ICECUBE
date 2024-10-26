use std::cell::RefCell;
use std::borrow::Cow;
use candid::{CandidType, Decode, Encode, Nat, Principal};
use serde::Deserialize;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell, StableLog};
use ic_stable_structures::storable::{Bound, Storable};
use types::{Account, Post, TokenError, TokenInitArgs};
mod icrc;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Debug, Clone)]
struct Asset {
    id: u64,
    post_id: String,
    creator: Principal,
    token_id: u64,
    time: u64
}

#[derive(CandidType, Deserialize, Debug, Clone)]
struct UserAssetIds(Vec<u64>);

#[derive(CandidType, Deserialize, Debug, Clone)]
struct CreateEvent {
    asset_id: u64,
    creator: Principal,
    post_id: String
}

#[derive(CandidType, Deserialize, Debug, Clone)]
struct RemoveEvent {
    asset_id: u64,
    sender: Principal
}

#[derive(CandidType, Deserialize, Debug, Clone)]
struct TradeEvent {
    asset_id: u64,
    trade_type: TradeType,
    sender: Principal,
    token_amount: u64,
    icp_amount: u64,
    creator_fee: u64
}

#[derive(CandidType, Deserialize, Debug, Clone)]
enum  TradeType {
    Mint,
    Buy,
    Sell
}

#[derive(CandidType, Deserialize, Debug, Clone)]
enum Error {
    AssetAlreadyCreated,
    AssetNotExist,
    Unauthorized,
    CreateTokenError,
    PostNotExistInBucket,
    GenericError{ message: String, error_code: candid::Nat },
    TemporarilyUnavailable,
    InsufficientAllowance{ allowance: candid::Nat },
    BadBurn{ min_burn_amount: candid::Nat },
    Duplicate{ duplicate_of: candid::Nat },
    BadFee{ expected_fee: candid::Nat },
    CreatedInFuture{ ledger_time: u64 },
    TooOld,
    InsufficientFunds{ balance: candid::Nat },
}

impl Storable for Asset {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for UserAssetIds {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for CreateEvent {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for RemoveEvent {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl Storable for TradeEvent {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

const CREATOR_PREMINT: u64 = 100_000_000; // 1e8
const CREATOR_FEE_PERCENT: u64 = 5_000_000; // 5_000_000 / 1e8 = 5%
const TOKEN_FEE: u64 = 0; 

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // asset_id-> Asset
    static ASSET_MAP: RefCell<StableBTreeMap<u64, Asset, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    static ASSET_INDEX: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))), 
            0
        ).unwrap()
    );

    // post_id -> asset_id
    static POST_TO_ASSET: RefCell<StableBTreeMap<String, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );

    // asset_id -> token_id
    static ASSET_TO_TOKEN: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))   
        )
    );

    // user -> Vec<asset_id>
    static USER_ASSET_MAP: RefCell<StableBTreeMap<Principal, UserAssetIds, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        )
    );

    // asset_id -> pool_value
    static POOL_VALUE: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
        )
    );

    // asset_id -> asset_token_supply
    static SUPPLY_MAP: RefCell<StableBTreeMap<u64, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6)))
        )
    );

    static CREATE_EVENT: RefCell<StableLog<CreateEvent, Memory, Memory>> = RefCell::new(
        StableLog::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))), 
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(8)))
        ).unwrap()
    );

    static REMOVE_EVENT: RefCell<StableLog<RemoveEvent, Memory, Memory>> = RefCell::new(
        StableLog::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(10))), 
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(11)))
        ).unwrap()
    );

    static TRADE_EVENT: RefCell<StableLog<TradeEvent, Memory, Memory>> = RefCell::new(
        StableLog::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(12))), 
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(13)))
        ).unwrap()
    );

    static TOKEN_CA: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(14))), 
            Principal::from_text("rvcxx-xiaaa-aaaan-qznha-cai").unwrap()
        ).unwrap()
    );

    // main_net : ryjl3-tyaaa-aaaaa-aaaba-cai
    // test_net : xqjmi-wiaaa-aaaan-qznra-cai
    static ICP_CA: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(15))), 
            Principal::from_text("xqjmi-wiaaa-aaaan-qznra-cai").unwrap()
        ).unwrap()
    )
}

#[ic_cdk::query]
fn is_post_be_asset(post_id: String) -> Option<u64> {
    POST_TO_ASSET.with(|map| {
        map.borrow().get(&post_id)
    })
}

#[ic_cdk::query]
fn is_posts_be_assets(post_id_vec: Vec<String>) -> Vec<Option<u64>> {
    let mut entries = Vec::new();
    POST_TO_ASSET.with(|map| {
        for post_id in post_id_vec {
            entries.push(map.borrow().get(&post_id))
        }
    });

    entries
}

#[ic_cdk::query]
fn get_asset(asset_id: u64) -> Option<Asset> {
    ASSET_MAP.with(|map| {
        map.borrow().get(&asset_id)
    })
}

#[ic_cdk::query]
fn get_asset_entries() -> Vec<Asset> {
    ASSET_MAP.with(|map| {
        let mut entries = Vec::new();
        
        for (_ , v) in map.borrow().iter() {
            entries.push(v);
        }

        entries
    })
}

// start_from 0
#[ic_cdk::query]
fn get_asset_entries_by_len(start: u64, len: u64) -> Vec<Asset> {
    ASSET_MAP.with(|map| {
        let mut entries = Vec::new();
        
        let mut i = 0;
        for (_ , v) in map.borrow().iter() {
            if i >= start && i < start + len {
                entries.push(v);
            }
            i += 1;
        }

        entries
    })
}

#[ic_cdk::query(composite = true)]
async fn get_holdings(user: Principal) -> Vec<(u64, Nat)> {
    let asset_id_vec = USER_ASSET_MAP.with(|map| {
        map.borrow().get(&user)
    });

    match asset_id_vec {
        None => vec![],
        Some(asset_ids) => {
            let asset_id_vec = asset_ids.0;
            let mut entries = Vec::new();

            for asset_id in asset_id_vec {
                let token_id = ASSET_TO_TOKEN.with(|map| {
                    map.borrow().get(&asset_id)
                });
                match token_id {
                    None => entries.push((asset_id, Nat::from(0u8))),
                    Some(token_id) => {
                        let balance_result = ic_cdk::call::<(u64, Account, ), (Result<Nat, TokenError>, )>(
                            TOKEN_CA.with(|ca| ca.borrow().get().clone()), 
                            "icrc1_balance_of", 
                            (token_id, Account {
                                owner: user,
                                subaccount: None
                            }, )
                        ).await.unwrap().0;

                        match balance_result {
                            Err(_) => entries.push((asset_id, Nat::from(0u8))),
                            Ok(balance) => entries.push((asset_id, balance)),
                        }
                    }
                }
            }

            entries
        }
    }
}

#[ic_cdk::query]
fn get_asset_index() -> u64 {
    ASSET_INDEX.with(|asset_index| {
        asset_index.borrow().get().clone()
    })
}

#[ic_cdk::query]
fn get_create_events() -> Vec<CreateEvent> {
    CREATE_EVENT.with(|logs| {
        let mut events = Vec::new();

        for log in logs.borrow().iter() {
            events.push(log);
        }

        events
    })
}

#[ic_cdk::query]
fn get_remove_events() -> Vec<RemoveEvent> {
    REMOVE_EVENT.with(|logs| {
        let mut events = Vec::new();

        for log in logs.borrow().iter() {
            events.push(log);
        }

        events
    })
}

#[ic_cdk::query]
fn get_trade_events() -> Vec<TradeEvent> {
    TRADE_EVENT.with(|logs| {
        let mut events = Vec::new();

        for log in logs.borrow().iter() {
            events.push(log);
        }

        events
    })
}

#[ic_cdk::query]
fn get_asset_to_token(asset_id: u64) -> Option<u64> {
    ASSET_TO_TOKEN.with(|map| {
        match map.borrow().get(&asset_id) {
            None => None,
            Some(token_id) => Some(token_id)
        }
    })
}

#[ic_cdk::query]
fn get_pool_value(asset_id: u64) -> Option<u64> {
    POOL_VALUE.with(|map| {
        match map.borrow().get(&asset_id) {
            None => None,
            Some(pool_value) => Some(pool_value)
        }
    })
}

#[ic_cdk::query]
fn get_recent_trade(asset_id: u64) -> Vec<TradeEvent> {
    let mut events = Vec::new();
    
    TRADE_EVENT.with(|logs| {
        for event in logs.borrow().iter() {
            if event.asset_id == asset_id {
                events.push(event);
            }
        }
    });

    events.reverse();

    events
}


#[ic_cdk::query(composite = true)]
async fn get_holders(asset_id: u64) -> Vec<(Principal, Nat)> {
    match ASSET_TO_TOKEN.with(|map| {
        map.borrow().get(&asset_id)
    }) {
        None => vec![],
        Some(token_id) => ic_cdk::call::<(u64, ), (Vec<(Principal, Nat)>, )>(
            TOKEN_CA.with(|ca| ca.borrow().get().clone()), 
            "get_holders", 
            (token_id, )
        ).await.unwrap().0
    }
}

#[ic_cdk::query]
fn get_share_supply(asset_id: u64) -> Option<u64> {
    SUPPLY_MAP.with(|map| {
        map.borrow().get(&asset_id)
    })
}

#[ic_cdk::query]
fn get_creator_premint() -> u64 { CREATOR_PREMINT }

#[ic_cdk::query]
fn get_creator_fee_precent() -> u64 { CREATOR_FEE_PERCENT }

// return (asset_id, token_id)
#[ic_cdk::update]
async fn create(post_id: String) -> Result<(u64, u64), Error> {
    // 去 Bucket 检查 
    let (bucket, _, _) = check_post_id(&post_id);
    let get_post_result = ic_cdk::call::<(String, ), (Option<Post>, )>(
        bucket, 
        "get_post", 
        (post_id.clone(), )
    ).await.unwrap().0;

    match get_post_result {
        None =>  Err(Error::PostNotExistInBucket),
        Some(post) => {
            let caller = ic_cdk::caller();
            if post.user != caller {
                return Err(Error::Unauthorized);
            }

            if POST_TO_ASSET.with(|map| {
                map.borrow().contains_key(&post_id)
            }) {
                return Err(Error::AssetAlreadyCreated);
            }

            let asset_id = ASSET_INDEX.with(|asset_index| asset_index.borrow().get().clone());
            ASSET_INDEX.with(|asset_index| asset_index.borrow_mut().set(asset_id + 1).unwrap());

            let create_token_result = ic_cdk::call::<(TokenInitArgs, ), (Result<u64, TokenError>, )>(
                TOKEN_CA.with(|ca| ca.borrow().get().clone()), 
                "create", 
                (TokenInitArgs {
                    decimals: 8u8,
                    fee: Nat::from(TOKEN_FEE),
                    mintint_account: None,
                    name: {
                        let mut s = "Dawnlight#".to_string();
                        s.push_str(asset_id.to_string().as_str());
                        s
                    },
                    symbol: {
                        let mut s = "Dawnlight#".to_string();
                        s.push_str(asset_id.to_string().as_str());
                        s
                    },
                    init_balances: vec![(caller, Nat::from(CREATOR_PREMINT))]
                }, )
            ).await.unwrap().0;

            match create_token_result {
                Err(_) => Err(Error::CreateTokenError),
                Ok(token_id) => {

                    let asset = Asset {
                        id: asset_id,
                        post_id: post_id.clone(),
                        creator: caller,
                        token_id: token_id,
                        time: ic_cdk::api::time()
                    };
                    ASSET_MAP.with(|map| {
                        map.borrow_mut().insert(asset_id, asset)
                    });

                    POST_TO_ASSET.with(|map| {
                        map.borrow_mut().insert(post_id.clone(), asset_id)
                    });

                    ASSET_TO_TOKEN.with(|map| {
                        map.borrow_mut().insert(asset_id, token_id)
                    });

                    match USER_ASSET_MAP.with(|map| {
                        map.borrow().get(&caller) 
                    }) {
                        None => {
                            USER_ASSET_MAP.with(|map| {
                                map.borrow_mut().insert(caller, UserAssetIds(vec![asset_id]))
                            });
                        },
                        Some(mut user_asset_ids) => {
                            user_asset_ids.0.push(asset_id);
                            USER_ASSET_MAP.with(|map| {
                                map.borrow_mut().insert(caller, user_asset_ids)
                            });
                        }
                    };

                    SUPPLY_MAP.with(|map| {
                        map.borrow_mut().insert(asset_id, CREATOR_PREMINT)
                    });

                    CREATE_EVENT.with(|logs| {
                        logs.borrow_mut().append(&CreateEvent {
                            asset_id: asset_id,
                            creator: caller,
                            post_id: post_id
                        }).unwrap()
                    });

                    TRADE_EVENT.with(|logs| {
                        logs.borrow_mut().append(&TradeEvent {
                            asset_id: asset_id,
                            trade_type: TradeType::Mint,
                            sender: caller,
                            token_amount: CREATOR_PREMINT,
                            icp_amount: 0,
                            creator_fee: 0
                        }).unwrap()
                    });

                    Ok((asset_id, token_id))
                }
            }
        }
    }
}

#[ic_cdk::update]
fn remove(asset_id: u64) -> Result<(), Error> {
    let caller = ic_cdk::caller();
    match ASSET_MAP.with(|map| {
        map.borrow().get(&asset_id)
    }) {
        None => Err(Error::AssetNotExist),
        Some(asset) => {
            if asset.creator != caller {
                return Err(Error::Unauthorized);
            }

            ASSET_MAP.with(|map| {
                map.borrow_mut().remove(&asset_id)
            });

            POST_TO_ASSET.with(|map| {
                map.borrow_mut().remove(&asset.post_id)
            });

            REMOVE_EVENT.with(|logs| {
                logs.borrow_mut().append(&RemoveEvent {
                    asset_id: asset_id,
                    sender: caller
                }).unwrap()
            });

            Ok(())
        }
    }
}

#[ic_cdk::update]
async fn buy(asset_id: u64, amount: u64) -> Result<(), Error> {
    if asset_id >= ASSET_INDEX.with(|index| index.borrow().get().clone()) {
        return Err(Error::AssetNotExist);
    }
    let caller = ic_cdk::caller();
    let price = get_buy_price(asset_id, amount);
    let creator_fee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;

    let transfer_from_result = icrc::icrc_2_transfer_from(
        ICP_CA.with(|ca| ca.borrow().get().clone()), 
        caller, 
        ic_cdk::api::id(), 
        price + creator_fee
    ).await;

    match transfer_from_result {
        icrc::TransferFromResult::Err(err) => {
            match err {
                icrc::TransferFromError::GenericError{message, error_code } => Err(Error::GenericError { message: message, error_code: error_code }),
                icrc::TransferFromError::TemporarilyUnavailable => Err(Error::TemporarilyUnavailable),
                icrc::TransferFromError::InsufficientAllowance{ allowance } => Err(Error::InsufficientAllowance { allowance: allowance }),
                icrc::TransferFromError::BadBurn{ min_burn_amount } => Err(Error::BadBurn { min_burn_amount: min_burn_amount }),
                icrc::TransferFromError::Duplicate { duplicate_of } => Err(Error::Duplicate { duplicate_of: duplicate_of }),
                icrc::TransferFromError::BadFee { expected_fee } => Err(Error::BadFee { expected_fee: expected_fee }),
                icrc::TransferFromError::CreatedInFuture{ ledger_time } => Err(Error::CreatedInFuture { ledger_time: ledger_time }),
                icrc::TransferFromError::TooOld => Err(Error::TooOld),
                icrc::TransferFromError::InsufficientFunds{ balance } => Err(Error::InsufficientFunds { balance: balance })
            }
        },
        icrc::TransferFromResult::Ok(_) => {
            match SUPPLY_MAP.with(|map| {
                map.borrow().get(&asset_id)
            }) {
                None => {
                    SUPPLY_MAP.with(|map| {
                        map.borrow_mut().insert(asset_id, amount)
                    });
                },
                Some(old_supply) => {
                    SUPPLY_MAP.with(|map| {
                        map.borrow_mut().insert(asset_id, old_supply + amount)
                    });
                }
            }
            
            match POOL_VALUE.with(|map| {
                map.borrow().get(&asset_id)
            }) {
                None => {
                    POOL_VALUE.with(|map| {
                        map.borrow_mut().insert(asset_id, price)
                    });
                },
                Some(old_value) => {
                    POOL_VALUE.with(|map| {
                        map.borrow_mut().insert(asset_id, old_value + price)
                    });
                }
            }

            match ASSET_TO_TOKEN.with(|map| {
                map.borrow().get(&asset_id)
            }) {
                None => return Err(Error::GenericError { message: String::from("Not Found Token_Id"), error_code: Nat::from(400u32) }),
                Some(token_id) => {
                    let mint_result = ic_cdk::call::<(u64, Principal, u64, ), (bool, )>(
                        ICP_CA.with(|ca| ca.borrow().get().clone()), 
                        "mint", 
                        (token_id, caller, amount, )
                    ).await.unwrap().0;
                    assert!(mint_result);

                    TRADE_EVENT.with(|logs| {
                        logs.borrow_mut().append(&TradeEvent {
                            asset_id: asset_id,
                            trade_type: TradeType::Buy,
                            sender: caller,
                            token_amount: amount,
                            icp_amount: price,
                            creator_fee: creator_fee
                        }).unwrap()
                    });
                    
                    let creator = ASSET_MAP.with(|map| {
                        map.borrow().get(&asset_id)
                    }).unwrap().creator;
                    let send_creator_fee_result = icrc::icrc_1_transfer(
                        ICP_CA.with(|ca| ca.borrow().get().clone()), 
                        creator, 
                        creator_fee
                    ).await;
                    match send_creator_fee_result {
                        icrc::TransferResult::Err(err) => {
                            match err {
                                icrc::TransferError::GenericError { message, error_code } => Err(Error::GenericError { message: message, error_code: error_code }),
                                icrc::TransferError::TemporarilyUnavailable => Err(Error::TemporarilyUnavailable),
                                icrc::TransferError::BadBurn { min_burn_amount } => Err(Error::BadBurn { min_burn_amount: min_burn_amount }),
                                icrc::TransferError::Duplicate { duplicate_of } => Err(Error::Duplicate { duplicate_of: duplicate_of }),
                                icrc::TransferError::BadFee { expected_fee } => Err(Error::BadFee { expected_fee: expected_fee }),
                                icrc::TransferError::CreatedInFuture { ledger_time } => Err(Error::CreatedInFuture { ledger_time: ledger_time }),
                                icrc::TransferError::TooOld => Err(Error::TooOld),
                                icrc::TransferError::InsufficientFunds { balance } => Err(Error::InsufficientFunds { balance: balance })
                            }
                        },
                        icrc::TransferResult::Ok(_) => {
                            Ok(())
                        }
                    }
                }
            }
        }
    }
}

#[ic_cdk::update]
async fn sell(asset_id: u64, amount: u64) -> Result<(), Error> {
    if asset_id >= ASSET_INDEX.with(|index| index.borrow().get().clone()) {
        return Err(Error::AssetNotExist);
    }
    let caller = ic_cdk::caller();

    let balance = icrc::icrc_1_balance_of(
        TOKEN_CA.with(|ca| ca.borrow().get().clone()), 
        caller
    ).await;
    if balance < Nat::from(amount) {
        return Err(Error::InsufficientFunds { balance: balance });
    }

    match SUPPLY_MAP.with(|map| {
        map.borrow().get(&asset_id)
    }) {
        None => Err(Error::AssetNotExist),
        Some(supply) => {
            if CREATOR_PREMINT + amount > supply {
                return Err(Error::GenericError { message: String::from("Supply not allowed below premint amount"), error_code: Nat::from(400u32) });
            }

            let price = get_sell_price(asset_id, amount);
            let creator_fee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;

            match ASSET_TO_TOKEN.with(|map| {
                map.borrow().get(&asset_id)
            }) {
                None => return Err(Error::GenericError { message: String::from("Not Found Token_Id"), error_code: Nat::from(400u32) }),
                Some(token_id) => {
                    let burn_result = ic_cdk::call::<(u64, Principal, u64, ), (bool, )>(
                        TOKEN_CA.with(|ca| ca.borrow().get().clone()), 
                        "burn", 
                        (token_id, caller, amount, )
                    ).await.unwrap().0;
                    assert!(burn_result);
                    
                    match SUPPLY_MAP.with(|map| {
                        map.borrow().get(&asset_id)
                    }) {
                        None => return Err(Error::GenericError { message: String::from("Supply Map Error"), error_code: Nat::from(400u32) }),
                        Some(old_supply) => {
                            SUPPLY_MAP.with(|map| {
                                map.borrow_mut().insert(asset_id, old_supply - amount)
                            });
                        }
                    }

                    match POOL_VALUE.with(|map| {
                        map.borrow().get(&asset_id)
                    }) {
                        None => return Err(Error::GenericError { message: String::from("Pool Value Map Error"), error_code: Nat::from(400u32) }),
                        Some(old_value) => {
                            POOL_VALUE.with(|map| {
                                map.borrow_mut().insert(asset_id, old_value - price)
                            });
                        }
                    }

                    TRADE_EVENT.with(|logs| {
                        logs.borrow_mut().append(&TradeEvent {
                            asset_id: asset_id,
                            trade_type: TradeType::Sell,
                            sender: caller,
                            token_amount: amount,
                            icp_amount: price,
                            creator_fee: creator_fee
                        }).unwrap()
                    });

                    let send_sell_result = icrc::icrc_1_transfer(
                        ICP_CA.with(|ca| ca.borrow().get().clone()), 
                        caller, 
                        price - creator_fee
                    ).await;
                    match send_sell_result {
                        icrc::TransferResult::Err(err) => {
                            match err {
                                icrc::TransferError::GenericError { message, error_code } => Err(Error::GenericError { message: message, error_code: error_code }),
                                icrc::TransferError::TemporarilyUnavailable => Err(Error::TemporarilyUnavailable),
                                icrc::TransferError::BadBurn { min_burn_amount } => Err(Error::BadBurn { min_burn_amount: min_burn_amount }),
                                icrc::TransferError::Duplicate { duplicate_of } => Err(Error::Duplicate { duplicate_of: duplicate_of }),
                                icrc::TransferError::BadFee { expected_fee } => Err(Error::BadFee { expected_fee: expected_fee }),
                                icrc::TransferError::CreatedInFuture { ledger_time } => Err(Error::CreatedInFuture { ledger_time: ledger_time }),
                                icrc::TransferError::TooOld => Err(Error::TooOld),
                                icrc::TransferError::InsufficientFunds { balance } => Err(Error::InsufficientFunds { balance: balance })
                            }
                        },
                        icrc::TransferResult::Ok(_) => {
                            let creator = ASSET_MAP.with(|map| {
                                map.borrow().get(&asset_id)
                            }).unwrap().creator;
                            let send_creator_fee_result = icrc::icrc_1_transfer(
                                ICP_CA.with(|ca| ca.borrow().get().clone()), 
                                creator, 
                                creator_fee
                            ).await;  
                            match send_creator_fee_result {
                                icrc::TransferResult::Err(err) => {
                                    match err {
                                        icrc::TransferError::GenericError { message, error_code } => Err(Error::GenericError { message: message, error_code: error_code }),
                                        icrc::TransferError::TemporarilyUnavailable => Err(Error::TemporarilyUnavailable),
                                        icrc::TransferError::BadBurn { min_burn_amount } => Err(Error::BadBurn { min_burn_amount: min_burn_amount }),
                                        icrc::TransferError::Duplicate { duplicate_of } => Err(Error::Duplicate { duplicate_of: duplicate_of }),
                                        icrc::TransferError::BadFee { expected_fee } => Err(Error::BadFee { expected_fee: expected_fee }),
                                        icrc::TransferError::CreatedInFuture { ledger_time } => Err(Error::CreatedInFuture { ledger_time: ledger_time }),
                                        icrc::TransferError::TooOld => Err(Error::TooOld),
                                        icrc::TransferError::InsufficientFunds { balance } => Err(Error::InsufficientFunds { balance: balance })
                                    }
                                },
                                icrc::TransferResult::Ok(_) => {
                                    Ok(())
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

#[ic_cdk::query]
fn get_buy_price(asset_id: u64, amount: u64) -> u64 {
    let supply = SUPPLY_MAP.with(|map| {
        map.borrow().get(&asset_id)
    }).unwrap();
    get_price(supply, amount)
}

#[ic_cdk::query]
fn get_sell_price(asset_id: u64, amount: u64) -> u64 {
    let supply = SUPPLY_MAP.with(|map| {
        map.borrow().get(&asset_id)
    }).unwrap();
    get_price(supply - amount, amount)
}

#[ic_cdk::query]
fn get_buy_price_after_fee(asset_id: u64, amount: u64) -> u64 {
    let price = get_buy_price(asset_id, amount);
    let creator_fee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;
    price + creator_fee
}

#[ic_cdk::query]
fn get_sell_price_after_fee(asset_id: u64, amount: u64) -> u64 {
    let price = get_sell_price(asset_id, amount);
    let creator_fee = (price * CREATOR_FEE_PERCENT) / CREATOR_PREMINT;
    price - creator_fee
}

fn curve(x: u64) -> u64 {
    if x <= CREATOR_PREMINT {
        0
    } else {
        (x - CREATOR_PREMINT) * (x - CREATOR_PREMINT) * (x - CREATOR_PREMINT)
    }
}

fn get_price(supply: u64, amount: u64) -> u64 {
    (curve(supply + amount) - curve(supply)) / CREATOR_PREMINT / CREATOR_PREMINT / 500u64
}

fn check_post_id(
    post_id: &String
) -> (Principal, Principal, u64) {
    let words: Vec<&str> = post_id.split("#").collect();
    let bucket = Principal::from_text(words[0]).unwrap();
    let user = Principal::from_text(words[1]).unwrap();
    let post_index = u64::from_str_radix(words[2], 10).unwrap();
    (bucket, user, post_index)
}

ic_cdk::export_candid!();