import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Asset {
  'id' : bigint,
  'creator' : Principal,
  'post_id' : string,
  'token_id' : bigint,
  'time' : bigint,
}
export interface CreateEvent {
  'creator' : Principal,
  'post_id' : string,
  'asset_id' : bigint,
}
export type Error = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'InsufficientAllowance' : { 'allowance' : bigint } } |
  { 'CreateTokenError' : null } |
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
export interface RemoveEvent { 'sender' : Principal, 'asset_id' : bigint }
export type Result = { 'Ok' : null } |
  { 'Err' : Error };
export type Result_1 = { 'Ok' : [bigint, bigint] } |
  { 'Err' : Error };
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
export interface _SERVICE {
  'buy' : ActorMethod<[bigint, bigint], Result>,
  'create' : ActorMethod<[string], Result_1>,
  'get_asset' : ActorMethod<[bigint], [] | [Asset]>,
  'get_asset_entries' : ActorMethod<[], Array<Asset>>,
  'get_asset_entries_by_len' : ActorMethod<[bigint, bigint], Array<Asset>>,
  'get_asset_index' : ActorMethod<[], bigint>,
  'get_asset_to_token' : ActorMethod<[bigint], [] | [bigint]>,
  'get_buy_price' : ActorMethod<[bigint, bigint], bigint>,
  'get_buy_price_after_fee' : ActorMethod<[bigint, bigint], bigint>,
  'get_create_events' : ActorMethod<[], Array<CreateEvent>>,
  'get_creator_fee_precent' : ActorMethod<[], bigint>,
  'get_creator_premint' : ActorMethod<[], bigint>,
  'get_holders' : ActorMethod<[bigint], Array<[Principal, bigint]>>,
  'get_holdings' : ActorMethod<[Principal], Array<[bigint, bigint]>>,
  'get_pool_value' : ActorMethod<[bigint], [] | [bigint]>,
  'get_recent_trade' : ActorMethod<[bigint], Array<TradeEvent>>,
  'get_remove_events' : ActorMethod<[], Array<RemoveEvent>>,
  'get_sell_price' : ActorMethod<[bigint, bigint], bigint>,
  'get_sell_price_after_fee' : ActorMethod<[bigint, bigint], bigint>,
  'get_share_supply' : ActorMethod<[bigint], [] | [bigint]>,
  'get_trade_events' : ActorMethod<[], Array<TradeEvent>>,
  'is_post_be_asset' : ActorMethod<[string], [] | [bigint]>,
  'is_posts_be_assets' : ActorMethod<[Array<string>], Array<[] | [bigint]>>,
  'remove' : ActorMethod<[bigint], Result>,
  'sell' : ActorMethod<[bigint, bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
