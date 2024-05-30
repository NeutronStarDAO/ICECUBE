mod utils;
mod root_bucket;
mod root_feed;
mod deploy;
mod feed;
mod photo_storage;
mod user;
mod test;
use candid::{Principal, Encode, Decode};
use lazy_static::lazy_static;
use dotenv::dotenv;
use std::env;

// use crate::did::{};

pub const USERA_PEM: &str = "test/identity/1.pem";
pub const USERB_PEM: &str = "test/identity/2.pem";
pub const USERC_PEM: &str = "test/identity/3.pem";
pub const USERD_PEM: &str = "test/identity/4.pem";
pub const USERE_PEM: &str = "test/identity/5.pem";

lazy_static! {
    // pub static ref ROOT_BUCKET_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_ROOT_BUCKET").unwrap()).unwrap();
    // pub static ref ROOT_FEED_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_ROOT_FEED").unwrap()).unwrap();
    // pub static ref ROOT_FETCH_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_ROOT_FETCH").unwrap()).unwrap();
    // pub static ref USER_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_USER").unwrap()).unwrap(); 
    // pub static ref PHOTO_STORAGE_CANISTER: Principal = Principal::from_text(env::var("CANISTER_ID_PHOTO_STORAGE").unwrap()).unwrap();

    pub static ref ROOT_BUCKET_CANISTER: Principal = Principal::from_text("bkyz2-fmaaa-aaaaa-qaaaq-cai").unwrap();
    pub static ref ROOT_FEED_CANISTER: Principal = Principal::from_text("asrmz-lmaaa-aaaaa-qaaeq-cai").unwrap();
    pub static ref ROOT_FETCH_CANISTER: Principal = Principal::from_text("br5f7-7uaaa-aaaaa-qaaca-cai").unwrap();
    pub static ref USER_CANISTER: Principal = Principal::from_text("be2us-64aaa-aaaaa-qaabq-cai").unwrap(); 
    pub static ref PHOTO_STORAGE_CANISTER: Principal = Principal::from_text("avqkn-guaaa-aaaaa-qaaea-cai").unwrap();
}

// pub async fn call_canister() {
//     let canister = Principal::from_text("").unwrap();
    
//     let response_blob = build_agent("./identity.pem")
//         .update(
//             &canister,
//             "method_name"
//         )
//         .with_arg(Encode!().unwrap())
//         .call_and_wait()
//         .await
//         .expect("Call Response Error !");
//     let result = Decode!(&response_blob, CallResultType).unwrap();

//     println!("result : {:?}", result);
// }


#[tokio::main]
async fn main() {
    dotenv().ok();

    println!("Principal A : {:?}\n", utils::build_agent(USERA_PEM).get_principal().unwrap().to_text());
    println!("Principal B : {:?}\n", utils::build_agent(USERB_PEM).get_principal().unwrap().to_text());
    println!("Principal C : {:?}\n", utils::build_agent(USERC_PEM).get_principal().unwrap().to_text());
    println!("Principal D : {:?}\n", utils::build_agent(USERD_PEM).get_principal().unwrap().to_text());
    println!("Principal E : {:?}\n", utils::build_agent(USERE_PEM).get_principal().unwrap().to_text());

    // deploy and init
    deploy::deploy().await;

    // test 
    test::test().await;

    // http://127.0.0.1:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai&id=bw4dl-smaaa-aaaaa-qaacq-cai
}
