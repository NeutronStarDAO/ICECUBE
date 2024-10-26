use candid::{CandidType, Deserialize};

#[derive(CandidType, Deserialize)]
pub struct Account { 
    pub owner: candid::Principal, 
    pub subaccount: Option<Subaccount> 
}
pub type Subaccount = Vec<u8>;

#[derive(CandidType, Deserialize)]
pub enum Value { 
    Int(candid::Int), 
    Nat(candid::Nat), 
    Blob(Vec<u8>), 
    Text(String) 
}

pub type Timestamp = u64;

#[derive(CandidType, Deserialize)]
pub struct TransferArgs {
    to: Account,
    fee: Option<candid::Nat>,
    memo: Option<Vec<u8>>,
    from_subaccount: Option<Subaccount>,
    created_at_time: Option<Timestamp>,
    amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
pub enum TransferError {
    GenericError{
        message: String, 
        error_code: candid::Nat 
    },
    TemporarilyUnavailable,
    BadBurn{ min_burn_amount: candid::Nat },
    Duplicate{ duplicate_of: candid::Nat },
    BadFee{ expected_fee: candid::Nat },
    CreatedInFuture{ ledger_time: Timestamp },
    TooOld,
    InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize)]
pub enum Icrc1transferResult { Ok(candid::Nat), Err(TransferError) }

#[derive(CandidType, Deserialize, Clone)]
pub struct Icrc1supportedStandardsResult { url: String, name: String }

#[derive(CandidType, Deserialize)]
pub struct AllowanceArgs { account: Account, spender: Account }

#[derive(CandidType, Deserialize)]
pub struct Icrc2allowanceResult { allowance: candid::Nat, expires_at: Option<u64> }

#[derive(CandidType, Deserialize)]
pub struct ApproveArgs {
  pub fee: Option<candid::Nat>,
  pub memo: Option<Vec<u8>>,
  pub from_subaccount: Option<Vec<u8>>,
  pub created_at_time: Option<u64>,
  pub amount: candid::Nat,
  pub expected_allowance: Option<candid::Nat>,
  pub expires_at: Option<u64>,
  pub spender: Account,
}

#[derive(CandidType, Deserialize)]
pub enum ApproveError {
  GenericError{ message: String, error_code: candid::Nat },
  TemporarilyUnavailable,
  Duplicate{ duplicate_of: candid::Nat },
  BadFee{ expected_fee: candid::Nat },
  AllowanceChanged{ current_allowance: candid::Nat },
  CreatedInFuture{ ledger_time: u64 },
  TooOld,
  Expired{ ledger_time: u64 },
  InsufficientFunds{ balance: candid::Nat },
}

#[derive(CandidType, Deserialize)]
pub enum Icrc2approveResult { Ok(candid::Nat), Err(ApproveError) }

#[derive(CandidType, Deserialize)]
struct TransferFromArgs {
  to: Account,
  fee: Option<candid::Nat>,
  spender_subaccount: Option<Vec<u8>>,
  from: Account,
  memo: Option<Vec<u8>>,
  created_at_time: Option<u64>,
  amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
enum TransferFromError {
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
enum Icrc2transferFromResult { Ok(candid::Nat), Err(TransferFromError) }