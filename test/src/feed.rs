use candid::{CandidType, Deserialize, Principal, Encode, Decode};
use ic_agent::Agent;
use serde_bytes;
use crate::utils::build_local_agent;
use crate::USERA_PEM;
use types::Post;

pub async fn create_post(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    content: String,
    photo_url: Vec<String>
) -> String {
    let response_blob = agent
        .update(
            &feed_canister, 
            "create_post"
        )
        .with_arg(Encode!(&content, &photo_url).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, String).unwrap()
}

pub async fn delete_post(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    post_id: String
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "delete_post"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn create_comment(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    post_id: String,
    content: String
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "create_comment"
        )
        .with_arg(Encode!(&post_id, &content).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn comment_comment(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    post_id: String,
    to: Principal,
    content: String
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "comment_comment"
        )
        .with_arg(Encode!(&post_id, &to, &content).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn like_comment(
    agent: Agent,
    feed_canister: Principal,
    post_id: String,
    comment_index: u64
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "like_comment"
        )
        .with_arg(Encode!(&post_id, &comment_index).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn like_comment_comment(
    agent: Agent,
    feed_canister: Principal,
    post_id: String,
    comment_index: u64
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "like_comment_comment"
        )
        .with_arg(Encode!(&post_id, &comment_index).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn create_like(
    agent: Agent,
    feed_canister: Principal,
    post_id: String,
) -> bool {
    let response_blob = agent
        .update(
            &feed_canister, 
            "create_like"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call_and_wait()
        .await.unwrap();
    
    Decode!(&response_blob, bool).unwrap()
}

pub async fn create_repost(
    agent: Agent,
    feed_canister: Principal,
    post_id: String
) -> bool {
    let reponse_blob = agent
        .update(
            &feed_canister, 
            "create_repost"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call_and_wait()
        .await.unwrap();

    Decode!(&reponse_blob, bool).unwrap()
}

pub async fn get_all_post(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    user: Principal
) -> Vec<Post> {
    let response_blob = agent
        .query(
            &feed_canister, 
            "get_all_post"
        )
        .with_arg(Encode!(&user).unwrap())
        .call()
        .await.unwrap();
    
    Decode!(&response_blob, Vec<Post>).unwrap()
}

pub async fn get_post(
    agent: ic_agent::Agent,
    feed_canister: Principal,
    post_id: String
) -> Option<Post> {
    let response_blob = agent
        .query(
            &feed_canister, 
            "get_post"
        )
        .with_arg(Encode!(&post_id).unwrap())
        .call()
        .await.unwrap();
    
    Decode!(&response_blob,Option<Post>).unwrap()
}

pub async fn get_feed_number(
    agent: Agent,
    feed_canister: Principal,
    user: Principal
) -> u64 {
    let response_blob = agent
        .query(
            &feed_canister, 
            "get_feed_number"
        )
        .with_arg(Encode!(&user).unwrap())
        .call().await.unwrap();
    
    Decode!(&response_blob, u64).unwrap()
}

pub async fn get_latest_feed(
    agent: Agent,
    feed_canister: Principal,
    user: Principal,
    n: u64
) -> Vec<Post> {
    let response_blob = agent
        .query(
            &feed_canister, 
            "get_latest_feed"
        )
        .with_arg(Encode!(&user, &n).unwrap())
        .call().await.unwrap();
    
    Decode!(&response_blob, Vec<Post>).unwrap()
}