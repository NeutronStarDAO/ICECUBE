export const idlFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
    'CreateTokenError' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'AssetNotExist' : IDL.Null,
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'Unauthorized' : IDL.Null,
    'AssetAlreadyCreated' : IDL.Null,
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'PostNotExistInBucket' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : Error });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Nat64, IDL.Nat64),
    'Err' : Error,
  });
  const Asset = IDL.Record({
    'id' : IDL.Nat64,
    'creator' : IDL.Principal,
    'post_id' : IDL.Text,
    'token_id' : IDL.Nat64,
    'time' : IDL.Nat64,
  });
  const CreateEvent = IDL.Record({
    'creator' : IDL.Principal,
    'post_id' : IDL.Text,
    'asset_id' : IDL.Nat64,
  });
  const TradeType = IDL.Variant({
    'Buy' : IDL.Null,
    'Mint' : IDL.Null,
    'Sell' : IDL.Null,
  });
  const TradeEvent = IDL.Record({
    'token_amount' : IDL.Nat,
    'trade_type' : TradeType,
    'sender' : IDL.Principal,
    'creator_fee' : IDL.Nat,
    'icp_amount' : IDL.Nat,
    'asset_id' : IDL.Nat64,
  });
  const RemoveEvent = IDL.Record({
    'sender' : IDL.Principal,
    'asset_id' : IDL.Nat64,
  });
  return IDL.Service({
    'buy' : IDL.Func([IDL.Nat64, IDL.Nat], [Result], []),
    'create' : IDL.Func([IDL.Text], [Result_1], []),
    'get_asset' : IDL.Func([IDL.Nat64], [IDL.Opt(Asset)], ['query']),
    'get_asset_entries' : IDL.Func([], [IDL.Vec(Asset)], ['query']),
    'get_asset_entries_by_len' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(Asset)],
        ['query'],
      ),
    'get_asset_index' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_asset_to_token' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(IDL.Nat64)],
        ['query'],
      ),
    'get_buy_price' : IDL.Func([IDL.Nat64, IDL.Nat], [IDL.Nat], ['query']),
    'get_buy_price_after_fee' : IDL.Func(
        [IDL.Nat64, IDL.Nat],
        [IDL.Nat],
        ['query'],
      ),
    'get_create_events' : IDL.Func([], [IDL.Vec(CreateEvent)], ['query']),
    'get_creator_fee_precent' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_creator_premint' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_holders' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['composite_query'],
      ),
    'get_holdings' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat))],
        ['composite_query'],
      ),
    'get_pool_value' : IDL.Func([IDL.Nat64], [IDL.Opt(IDL.Nat)], ['query']),
    'get_recent_trade' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(TradeEvent)],
        ['query'],
      ),
    'get_remove_events' : IDL.Func([], [IDL.Vec(RemoveEvent)], ['query']),
    'get_sell_price' : IDL.Func([IDL.Nat64, IDL.Nat], [IDL.Nat], ['query']),
    'get_sell_price_after_fee' : IDL.Func(
        [IDL.Nat64, IDL.Nat],
        [IDL.Nat],
        ['query'],
      ),
    'get_share_supply' : IDL.Func([IDL.Nat64], [IDL.Opt(IDL.Nat)], ['query']),
    'get_trade_events' : IDL.Func([], [IDL.Vec(TradeEvent)], ['query']),
    'is_post_be_asset' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Nat64)], ['query']),
    'is_posts_be_assets' : IDL.Func(
        [IDL.Vec(IDL.Text)],
        [IDL.Vec(IDL.Opt(IDL.Nat64))],
        ['query'],
      ),
    'remove' : IDL.Func([IDL.Nat64], [Result], []),
    'sell' : IDL.Func([IDL.Nat64, IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
