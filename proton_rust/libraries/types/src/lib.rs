mod http;
use candid::{Principal, CandidType, Deserialize};
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
    pub user: Principal,
    pub content: String,
    pub created_at: u64
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Post {
    pub post_id: String, // 帖子 ID 
    pub feed_canister: Principal,
    pub index: u128, // Post Index
    pub user: Principal, // 发布者
    pub content: String,
    pub photo_url: Vec<String>, // photo url array
    pub repost: Vec<Repost>, //转发者
    pub like: Vec<Like>,
    pub comment: Vec<Comment>,
    pub created_at: u64 // 发布时间
}

#[derive(CandidType, Deserialize, Debug)]
pub struct FeedInitArg {
    pub root_bucket: Principal,
    pub user_actor: Principal,
    pub comment_fetch_actor: Principal,
    pub like_fetch_actor: Principal,
    pub owner: Principal
}

#[derive(CandidType, Deserialize, Debug)]
pub struct FetchInitArg {
    pub user_actor: Principal,
}

pub type NewRepost = Vec<Repost>;
pub type NewComment = Vec<Comment>;
pub type NewLike = Vec<Like>;