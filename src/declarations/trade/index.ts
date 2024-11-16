import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Asset {
  'id' : bigint,
  'creator' : Principal,
  'post_id' : string,
  'time' : bigint,
}
export interface CreateEvent {
  'creator' : Principal,
  'post_id' : string,
  'asset_id' : bigint,
}
export interface Icrc1supportedStandardsResult {
  'url' : string,
  'name' : string,
}
export interface RemoveEvent { 'sender' : Principal, 'asset_id' : bigint }
export type Result = { 'Ok' : null } |
  { 'Err' : TradeError };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : TradeError };
export type TradeError = {
  'GenericError' : { 'message' : string, 'error_code' : bigint }
} |
  { 'TemporarilyUnavailable' : null } |
  { 'InsufficientAllowance' : { 'allowance' : bigint } } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'AssetNotExist' : null } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'Unauthorized' : null } |
  { 'AssetAlreadyCreated' : null } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'PostNotExistInBucket' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface TradeEvent {
  'token_amount' : bigint,
  'trade_type' : TradeType,
  'sender' : Principal,
  'creator_fee' : bigint,
  'icp_amount' : bigint,
  'asset_id' : bigint,
}
export type TradeType = { 'Buy' : null } |
  { 'Mint' : null } |
  { 'Sell' : null };
export type Value = { 'Int' : bigint } |
  { 'Nat' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Text' : string };
export interface _SERVICE {
  'batch_get_asset' : ActorMethod<
    [BigUint64Array | bigint[]],
    Array<[] | [Asset]>
  >,
  'buy' : ActorMethod<[bigint, bigint], Result>,
  'create' : ActorMethod<[string], Result_1>,
  'get_asset' : ActorMethod<[bigint], [] | [Asset]>,
  'get_asset_entires_sorted_by_vol' : ActorMethod<[], Array<[Asset, bigint]>>,
  'get_asset_entries' : ActorMethod<[], Array<Asset>>,
  'get_asset_entries_by_len' : ActorMethod<[bigint, bigint], Array<Asset>>,
  'get_asset_index' : ActorMethod<[], bigint>,
  'get_buy_price' : ActorMethod<[bigint, bigint], bigint>,
  'get_buy_price_after_fee' : ActorMethod<[bigint, bigint], bigint>,
  'get_create_events' : ActorMethod<[], Array<CreateEvent>>,
  'get_creator_fee_precent' : ActorMethod<[], bigint>,
  'get_creator_premint' : ActorMethod<[], bigint>,
  'get_holders' : ActorMethod<[bigint], Array<[Principal, bigint]>>,
  'get_holdings' : ActorMethod<[Principal], Array<[bigint, bigint]>>,
  'get_icp_ca' : ActorMethod<[], Principal>,
  'get_pool_value' : ActorMethod<[bigint], [] | [bigint]>,
  'get_recent_trade' : ActorMethod<[bigint], Array<TradeEvent>>,
  'get_remove_events' : ActorMethod<[], Array<RemoveEvent>>,
  'get_sell_price' : ActorMethod<[bigint, bigint], bigint>,
  'get_sell_price_after_fee' : ActorMethod<[bigint, bigint], bigint>,
  'get_trade_events' : ActorMethod<[], Array<TradeEvent>>,
  'icrc1_balance_of' : ActorMethod<[bigint, Principal], bigint>,
  'icrc1_decimals' : ActorMethod<[bigint], number>,
  'icrc1_fee' : ActorMethod<[bigint], bigint>,
  'icrc1_metadata' : ActorMethod<[bigint], Array<[string, Value]>>,
  'icrc1_minting_account' : ActorMethod<[bigint], [] | [Account]>,
  'icrc1_name' : ActorMethod<[bigint], string>,
  'icrc1_supported_standards' : ActorMethod<
    [bigint],
    Array<Icrc1supportedStandardsResult>
  >,
  'icrc1_symbol' : ActorMethod<[bigint], string>,
  'icrc1_total_supply' : ActorMethod<[bigint], bigint>,
  'is_post_be_asset' : ActorMethod<[string], [] | [bigint]>,
  'is_posts_be_assets' : ActorMethod<[Array<string>], Array<[] | [bigint]>>,
  'remove' : ActorMethod<[bigint], Result>,
  'sell' : ActorMethod<[bigint, bigint], Result>,
  'update_icp_ca' : ActorMethod<[Principal], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
