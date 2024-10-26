use candid::{CandidType, Deserialize, Principal, Nat};

#[derive(CandidType, Deserialize)]
pub struct Account {
  pub owner: Principal,
  pub subaccount: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize)]
pub struct Allowance { 
    pub allowance: candid::Nat, 
    pub expires_at: Option<u64> 
}

#[derive(CandidType, Deserialize)]
pub struct AllowanceArgs { 
    pub account: Account, 
    pub spender: Account 
}

#[derive(CandidType, Deserialize)]
pub enum TransferError {
  GenericError{ message: String, error_code: candid::Nat },
  TemporarilyUnavailable,
  BadBurn{ min_burn_amount: candid::Nat },
  Duplicate{ duplicate_of: candid::Nat },
  BadFee{ expected_fee: candid::Nat },
  CreatedInFuture{ ledger_time: u64 },
  TooOld,
  InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize)]
pub struct TransferArg {
  pub to: Account,
  pub fee: Option<candid::Nat>,
  pub memo: Option<serde_bytes::ByteBuf>,
  pub from_subaccount: Option<serde_bytes::ByteBuf>,
  pub created_at_time: Option<u64>,
  pub amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
pub enum TransferResult { Ok(candid::Nat), Err(TransferError) }

#[derive(CandidType, Deserialize)]
pub enum TransferFromError {
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

#[derive(CandidType, Deserialize)]
pub struct TransferFromArgs {
  pub to: Account,
  pub fee: Option<candid::Nat>,
  pub spender_subaccount: Option<serde_bytes::ByteBuf>,
  pub from: Account,
  pub memo: Option<serde_bytes::ByteBuf>,
  pub created_at_time: Option<u64>,
  pub amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
pub enum TransferFromResult { 
    Ok(candid::Nat), 
    Err(TransferFromError) 
}

pub async fn icrc1_balance_of(token: Principal, user: Principal) -> Nat {
    let args = Account {
        owner: user,
        subaccount: None
    };
    
    let result = ic_cdk::call::<(Account, ), (Nat, )>(
        token, 
        "icrc1_balance_of", 
        (args, )
    ).await.unwrap().0;

    result
}

pub async fn icrc1_transfer(token: Principal, to: Principal, amount: Nat) -> TransferResult {
    let args = TransferArg {
        to: Account {
            owner: to,
            subaccount: None
        },
        fee: None,
        memo: None,
        from_subaccount: None,
        created_at_time: None,
        amount: Nat::from(amount)
    };
    
    let result = ic_cdk::call::<(TransferArg, ), (TransferResult, )>(
        token, 
        "icrc1_transfer", 
        (args, )
    ).await.unwrap().0;

    result
}

pub async fn icrc2_allowance(token: Principal, account: Principal, spender: Principal) -> Allowance {
    let args = AllowanceArgs {
        account: Account {
            owner: account,
            subaccount: None
        },
        spender: Account {
            owner: spender,
            subaccount: None
        }
    };
    let result = ic_cdk::call::<(AllowanceArgs, ), (Allowance,)>(
        token, 
        "icrc2_allowance", 
        (args, )
    ).await.unwrap().0;

    result
}

pub async fn icrc2_transfer_from(token: Principal, from: Principal, to: Principal, amount: Nat) -> TransferFromResult {
    let args = TransferFromArgs {
        to: Account {
            owner: to,
            subaccount: None
        },
        fee: None,
        spender_subaccount: None,
        from: Account {
            owner: from,
            subaccount: None
        },
        memo: None,
        created_at_time: None,
        amount: amount
    };
    
    let result = ic_cdk::call::<(TransferFromArgs, ), (TransferFromResult, )>(
        token, 
        "icrc2_transfer_from", 
        (args, )
    ).await.unwrap().0;

    result
}