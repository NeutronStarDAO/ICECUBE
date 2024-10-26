use crate::{USERA, USERB};
use candid::{Principal, CandidType, Deserialize, Nat};
use pocket_ic::PocketIc;
use crate::feed;
use crate::icrc::{ApproveArgs, Account, Icrc2approveResult};
use types::{TradeError};
const T_CYCLES: u64 = 10_u64.pow(12);

#[derive(CandidType, Deserialize, Debug)]
pub struct TradeInfo {
    trade_canister: Principal,
    test_icp_canister: Principal
}


fn deploy_trade(pic: &PocketIc) -> TradeInfo {
    let trade_canister = pic.create_canister();
    pic.add_cycles(trade_canister, (10 * T_CYCLES) as u128);
    let trade_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/trade.wasm").to_vec();
    pic.install_canister(trade_canister, trade_wasm, vec![], None);

    let test_icp_canister = pic.create_canister();
    pic.add_cycles(test_icp_canister, (4 * T_CYCLES) as u128);
    let test_icp_wasm = include_bytes!("../../target/wasm32-unknown-unknown/release/test_icp.wasm").to_vec();
    pic.install_canister(test_icp_canister, test_icp_wasm, vec![], None);

    let update_result = pocket_ic::update_candid::<(Principal, ), (bool, )>(
        pic, 
        trade_canister, 
        "test_update_canister", 
        (test_icp_canister, )
    ).unwrap().0;
    assert!(update_result);

    TradeInfo {
        trade_canister: trade_canister,
        test_icp_canister: test_icp_canister
    }
}

#[test]
fn test_create() {
    let pic = PocketIc::new();

    let proton_info = feed::deploy_proton(&pic);
    let trade_info = deploy_trade(&pic);

    // User A create a post
    let user_a = Principal::from_text(USERA).unwrap();
    let post_id = pocket_ic::update_candid_as::<(String, Vec<String>, ), (String, )>(
        &pic, 
        proton_info.feed_canister,
        user_a,
        "create_post",
        ("user_a create_post to test create a dawnlight".to_string(), vec![], )
    ).unwrap().0;

    // create a trade
    let create_result = pocket_ic::update_candid_as::<(String, ), (Result<u64, TradeError>, )>(
        &pic, 
        trade_info.trade_canister, 
        user_a, 
        "create", 
        (post_id, )
    ).unwrap().0;
    assert!(create_result.unwrap() == 0);
}

#[test]
fn test_buy() {
    let pic = PocketIc::new();

    let proton_info = feed::deploy_proton(&pic);
    let trade_info = deploy_trade(&pic);

    // User A create a post
    let user_a = Principal::from_text(USERA).unwrap();
    let post_id = pocket_ic::update_candid_as::<(String, Vec<String>, ), (String, )>(
        &pic, 
        proton_info.feed_canister,
        user_a,
        "create_post",
        ("user_a create_post to test create a dawnlight".to_string(), vec![], )
    ).unwrap().0;

    // create a trade
    let create_result = pocket_ic::update_candid_as::<(String, ), (Result<u64, TradeError>, )>(
        &pic, 
        trade_info.trade_canister, 
        user_a, 
        "create", 
        (post_id, )
    ).unwrap().0;
    let asset_id = create_result.unwrap();
    assert!(asset_id == 0);

    // User B buy a share
    let user_b = Principal::from_text(USERB).unwrap();

        // Mint test_icp
    let mint_result = pocket_ic::update_candid::<(Principal, Nat, ), (bool, )>(
        &pic, 
        trade_info.test_icp_canister, 
        "mint", 
        (user_b, Nat::from(1000u64 * 100_000_000), )
    ).unwrap().0;
    assert!(mint_result);

        // Approve ICP to trade_canister
    let approve_result = pocket_ic::update_candid_as::<(ApproveArgs, ), (Icrc2approveResult, )>(
        &pic, 
        trade_info.test_icp_canister, 
        user_b, 
        "icrc2_approve", 
        (ApproveArgs {
            fee: None,
            memo: None,
            from_subaccount: None,
            created_at_time: None,
            amount: Nat::from(1000u64 * 100_000_000),
            expected_allowance: None,
            expires_at: None,
            spender: Account {
                owner: trade_info.trade_canister,
                subaccount: None
            }
        }, )
    ).unwrap().0;
    match approve_result {
        Icrc2approveResult::Err(_) => assert!(false),
        Icrc2approveResult::Ok(_) => assert!(true)
    }

        // buy
    let buy_result = pocket_ic::update_candid_as::<(u64, Nat, ), (Result<(), TradeError>, )>(
        &pic, 
        trade_info.trade_canister, 
        user_b, 
        "buy", 
        (asset_id, Nat::from(100_000_000u64), )
    ).unwrap().0;
    assert!(buy_result.is_ok());
}

fn test_sell() {
    let pic = PocketIc::new();

    let proton_info = feed::deploy_proton(&pic);
    let trade_info = deploy_trade(&pic);

    // User A create a post
    let user_a = Principal::from_text(USERA).unwrap();
    let post_id = pocket_ic::update_candid_as::<(String, Vec<String>, ), (String, )>(
        &pic, 
        proton_info.feed_canister,
        user_a,
        "create_post",
        ("user_a create_post to test create a dawnlight".to_string(), vec![], )
    ).unwrap().0;

    // create a trade
    let create_result = pocket_ic::update_candid_as::<(String, ), (Result<u64, TradeError>, )>(
        &pic, 
        trade_info.trade_canister, 
        user_a, 
        "create", 
        (post_id, )
    ).unwrap().0;
    let asset_id = create_result.unwrap();
    assert!(asset_id == 0);

    // User B buy 10 share
    let user_b = Principal::from_text(USERB).unwrap();

        // Mint test_icp
    let mint_result = pocket_ic::update_candid::<(Principal, Nat, ), (bool, )>(
        &pic, 
        trade_info.test_icp_canister, 
        "mint", 
        (user_b, Nat::from(1000u64 * 100_000_000), )
    ).unwrap().0;
    assert!(mint_result);

        // Approve ICP to trade_canister
    let approve_result = pocket_ic::update_candid_as::<(ApproveArgs, ), (Icrc2approveResult, )>(
        &pic, 
        trade_info.test_icp_canister, 
        user_b, 
        "icrc2_approve", 
        (ApproveArgs {
            fee: None,
            memo: None,
            from_subaccount: None,
            created_at_time: None,
            amount: Nat::from(1000u64 * 100_000_000),
            expected_allowance: None,
            expires_at: None,
            spender: Account {
                owner: trade_info.trade_canister,
                subaccount: None
            }
        }, )
    ).unwrap().0;
    match approve_result {
        Icrc2approveResult::Err(_) => assert!(false),
        Icrc2approveResult::Ok(_) => assert!(true)
    }

        // buy
    let buy_result = pocket_ic::update_candid_as::<(u64, Nat, ), (Result<(), TradeError>, )>(
        &pic, 
        trade_info.trade_canister, 
        user_b, 
        "buy", 
        (asset_id, Nat::from(10 * 100_000_000u64), )
    ).unwrap().0;
    assert!(buy_result.is_ok());

    // User B Sell a share 
    let sell_result = pocket_ic::update_candid_as::<(u64, Nat, ), (Result<(), TradeError>, )>(
        &pic, 
        trade_info.trade_canister, 
        user_b, 
        "sell", 
        (asset_id, Nat::from(100_000_000u64), )
    ).unwrap().0;
    assert!(sell_result.is_ok());
}