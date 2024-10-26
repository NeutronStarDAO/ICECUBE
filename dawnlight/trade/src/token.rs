use candid::{CandidType, Deserialize, Nat, Principal, Encode, Decode};
use std::collections::HashMap;
use std::borrow::Cow;
use ic_stable_structures::storable::{Bound, Storable};
use types::{TokenInitArgs, Account, Subaccount};

#[derive(CandidType, Deserialize)]
pub enum Value { 
    Int(candid::Int), 
    Nat(candid::Nat), 
    Blob(Vec<u8>), 
    Text(String) 
}

type Timestamp = u64;

#[derive(CandidType, Deserialize)]
struct TransferArgs {
    to: Account,
    fee: Option<candid::Nat>,
    memo: Option<Vec<u8>>,
    from_subaccount: Option<Subaccount>,
    created_at_time: Option<Timestamp>,
    amount: candid::Nat,
}

#[derive(CandidType, Deserialize)]
enum TransferError {
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
enum Icrc1transferResult { Ok(candid::Nat), Err(TransferError) }

#[derive(CandidType, Deserialize, Clone)]
pub struct Icrc1supportedStandardsResult { url: String, name: String }

#[derive(CandidType, Deserialize)]
struct AllowanceArgs { account: Account, spender: Account }

#[derive(CandidType, Deserialize)]
struct Icrc2allowanceResult { allowance: candid::Nat, expires_at: Option<u64> }

#[derive(CandidType, Deserialize)]
struct ApproveArgs {
  fee: Option<candid::Nat>,
  memo: Option<Vec<u8>>,
  from_subaccount: Option<Vec<u8>>,
  created_at_time: Option<u64>,
  amount: candid::Nat,
  expected_allowance: Option<candid::Nat>,
  expires_at: Option<u64>,
  spender: Account,
}

#[derive(CandidType, Deserialize)]
enum ApproveError {
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
enum Icrc2approveResult { Ok(candid::Nat), Err(ApproveError) }

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

#[derive(CandidType, Deserialize, Clone)]
pub struct Token {
    balances: HashMap<Principal, Nat>,
    allowances: HashMap<(Principal, Principal), (Nat, Option<u64>)>,
    decimals: u8,
    fee: Nat,
    mintint_account: Option<Account>,
    name: String,
    icrc1_supported_standards: Vec<Icrc1supportedStandardsResult>,
    symbol: String,
    total_supply: Nat,
    transfer_tx_index: Nat,
    approve_tx_index: Nat,
    transfer_from_tx_index: Nat
}

impl Token {
    pub fn init(args: TokenInitArgs) -> Self {
        let mut token = Token {
            balances: HashMap::new(),
            allowances: HashMap::new(),
            decimals: args.decimals,
            fee: args.fee,
            mintint_account: args.mintint_account,
            name: args.name,
            icrc1_supported_standards: vec![
                Icrc1supportedStandardsResult {
                    url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1".to_string(),
                    name: "ICRC-1".to_string()
                },
                Icrc1supportedStandardsResult {
                    url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2".to_string(),
                    name: "ICRC-2".to_string()
                }
            ],
            symbol: args.symbol,
            total_supply: Nat::from(0u8),
            transfer_tx_index: Nat::from(0u8),
            approve_tx_index: Nat::from(0u8),
            transfer_from_tx_index: Nat::from(0u8)
        };
        
        token.mint(args.init_balances);

        token
    }

    pub fn mint(&mut self, mint_vec: Vec<(Principal, Nat)>) -> bool {
        for (account, amount) in mint_vec {
            let old_balance = self.icrc1_balance_of(Account {
                owner: account,
                subaccount: None
            });
            self.balances.insert(account, old_balance + amount.clone());
            self.total_supply += amount;
        }
        true
    }

    pub fn burn(&mut self, from: Principal, amount: Nat) -> bool {
        let old_balance = self.icrc1_balance_of(Account {
            owner: from,
            subaccount: None
        });
        self.balances.insert(from, old_balance - amount.clone());
        self.total_supply -= amount;
        true
    }

    pub fn get_holders(&self) -> Vec<(Principal, Nat)> {
        let mut holder_vec = Vec::new();
        for (account, balance) in self.balances.iter() {
            if balance > &Nat::from(0u8) {
                holder_vec.push((account.clone(), balance.clone()));
            }
        }
        holder_vec.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap());
        holder_vec.reverse();
        holder_vec
    }

    pub fn icrc1_balance_of(&self,account: Account) -> candid::Nat {
        match self.balances.get(&account.owner) {
            None => Nat::from(0u8),
            Some(balance) => balance.clone()
        }
    }

    pub fn icrc1_decimals(&self) -> u8 {
        self.decimals
    }

    pub fn icrc1_fee(&self) -> candid::Nat {
        self.fee.clone()
    }

    pub fn icrc1_metadata(&self) -> Vec<(String, Value)> {
        vec![
            ("icrc1:fee".to_string(), Value::Nat(self.fee.clone())),
            ("icrc1:name".to_string(), Value::Text(self.name.clone())),
            ("icrc1:symbol".to_string(), Value::Text(self.symbol.clone())),
            ("icrc1:total_supply".to_string(), Value::Nat(self.total_supply.clone())),
            ("icrc1:decimals".to_string(), Value::Nat(self.decimals.into())),
            ("icrc1:minting_account".to_string(), Value::Text(self.mintint_account.clone().unwrap().owner.to_string())),
        ]
    }

    pub fn icrc1_minting_account(&self) -> Option<Account> {
        self.mintint_account.clone()
    }

    pub fn icrc1_name(&self) -> String {
        self.name.clone()
    }

    pub fn icrc1_supported_standards(&self) -> Vec<Icrc1supportedStandardsResult> {
        self.icrc1_supported_standards.clone()
    }

    pub fn icrc1_symbol(&self) -> String {
        self.symbol.clone()
    }

    pub fn icrc1_total_supply(&self) -> candid::Nat {
        self.total_supply.clone()
    }
}

impl Storable for Token {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}