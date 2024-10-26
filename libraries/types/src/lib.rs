mod http;
use candid::{CandidType, Decode, Deserialize, Encode, Principal, Nat};
use std::borrow::Cow;
use ic_stable_structures::storable::{Bound, Storable};
pub use http::*;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Repost {
    pub user: Principal,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Like {
    pub user: Principal,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Comment {
    pub index: Option<u64>,
    pub user: Principal,
    pub content: String,
    pub created_at: u64,
    pub like: Option<Vec<Like>>
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CommentToComment {
    pub index: u64,
    pub from_user: Principal,
    pub to_index: u64,
    pub content: String,
    pub created_at: u64,
    pub like: Vec<Like>
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct CommentTreeNode {
    pub dep: u64, // 第几层
    pub father: u64, // father_index
    pub comment: Option<Comment>,
    pub comment_to_comment: Option<CommentToComment>
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Post {
    pub post_id: String, // 帖子 ID 
    pub feed_canister: Principal,
    pub index: u64, // Post Index
    pub user: Principal, // 发布者
    pub content: String,
    pub photo_url: Vec<String>, // photo url array
    pub repost: Vec<Repost>, //转发者
    pub like: Vec<Like>,
    pub comment_index: Option<u64>,
    pub comment: Vec<Comment>,
    pub comment_to_comment: Option<Vec<CommentToComment>>,
    pub created_at: u64 // 发布时间
}

impl Storable for Post {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

#[derive(CandidType, Deserialize, Debug)]
pub struct FeedInitArg {
    pub root_bucket: Principal,
    pub user_actor: Principal,
    pub post_fetch_actor: Principal,
    pub owner: Principal
}

#[derive(CandidType, Deserialize, Debug)]
pub struct FetchInitArg {
    pub user_actor: Principal,
    pub root_feed: Principal
}

pub type Subaccount = Vec<u8>;

#[derive(CandidType, Deserialize, Clone)]
pub struct Account { 
    pub owner: candid::Principal, 
    pub subaccount: Option<Subaccount> 
}

#[derive(CandidType, Deserialize, Clone)]
pub struct TokenInitArgs {
    pub asset_id: u64,
    pub decimals: u8,
    pub fee: Nat,
    pub mintint_account: Option<Account>,
    pub name: String,
    pub symbol: String,
    pub init_balances: Vec<(Principal, Nat)>
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum TradeError {
    AssetAlreadyCreated,
    AssetNotExist,
    Unauthorized,
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