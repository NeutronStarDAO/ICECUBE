# IceCube🧊 - A Social DApp 100% on chain

<img src="https://github.com/user-attachments/assets/4245a30f-c93e-47f5-bf6c-9522bdac0c17" style="width: 27%;" />

<br>

A Social DApp, a DApp like X/Twitter but with modular data sovereignty based on the Actor model.

## Getting Started
Run：
```shell
./start.sh
```

## More Info
Wanna learn more about this here project? Visit [here](https://forum.dfinity.org/t/proton-a-socialfi-dapp-totally-base-on-actor-model/24832) for details on the architecture, roadmap, and more.

We'd be much obliged if y'all would try it out and share feedback. Happy trails!

# Develop

## Extract Candid
```shell
cargo build --release --target wasm32-unknown-unknown

candid-extractor target/wasm32-unknown-unknown/release/bucket.wasm > bucket/bucket/bucket.did

candid-extractor target/wasm32-unknown-unknown/release/root_bucket.wasm > bucket/root_bucket/root_bucket.did

candid-extractor target/wasm32-unknown-unknown/release/feed.wasm > feed/feed/feed.did

candid-extractor target/wasm32-unknown-unknown/release/root_feed.wasm > feed/root_feed/root_feed.did

candid-extractor target/wasm32-unknown-unknown/release/comment_fetch.wasm > fetch/comment_fetch/comment_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/like_fetch.wasm > fetch/like_fetch/like_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/post_fetch.wasm > fetch/post_fetch/post_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/root_fetch.wasm > fetch/root_fetch/root_fetch.did

candid-extractor target/wasm32-unknown-unknown/release/user.wasm > user/user.did
```
