export const idlFactory = ({ IDL }) => {
  const Asset = IDL.Record({
    'id' : IDL.Nat64,
    'creator' : IDL.Principal,
    'post_id' : IDL.Text,
    'time' : IDL.Nat64,
  });
  const TradeError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
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
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : TradeError });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : TradeError });
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
  const Value = IDL.Variant({
    'Int' : IDL.Int,
    'Nat' : IDL.Nat,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Icrc1supportedStandardsResult = IDL.Record({
    'url' : IDL.Text,
    'name' : IDL.Text,
  });
  return IDL.Service({
    'batch_get_asset' : IDL.Func(
      [IDL.Vec(IDL.Nat64)],
      [IDL.Vec(IDL.Opt(Asset))],
      ['query'],
    ),
    'buy' : IDL.Func([IDL.Nat64, IDL.Nat], [Result], []),
    'create' : IDL.Func([IDL.Text], [Result_1], []),
    'get_asset' : IDL.Func([IDL.Nat64], [IDL.Opt(Asset)], ['query']),
    'get_asset_entires_sorted_by_vol' : IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(Asset, IDL.Nat))],
      ['query'],
    ),
    'get_asset_entries' : IDL.Func([], [IDL.Vec(Asset)], ['query']),
    'get_asset_entries_by_len' : IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(Asset)],
      ['query'],
    ),
    'get_asset_index' : IDL.Func([], [IDL.Nat64], ['query']),
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
      ['query'],
    ),
    'get_holdings' : IDL.Func(
      [IDL.Principal],
      [IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat))],
      ['query'],
    ),
    'get_icp_ca' : IDL.Func([], [IDL.Principal], ['query']),
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
    'get_trade_events' : IDL.Func([], [IDL.Vec(TradeEvent)], ['query']),
    'icrc1_balance_of' : IDL.Func(
      [IDL.Nat64, IDL.Principal],
      [IDL.Nat],
      ['query'],
    ),
    'icrc1_decimals' : IDL.Func([IDL.Nat64], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([IDL.Nat64], [IDL.Nat], ['query']),
    'icrc1_metadata' : IDL.Func(
      [IDL.Nat64],
      [IDL.Vec(IDL.Tuple(IDL.Text, Value))],
      ['query'],
    ),
    'icrc1_minting_account' : IDL.Func(
      [IDL.Nat64],
      [IDL.Opt(Account)],
      ['query'],
    ),
    'icrc1_name' : IDL.Func([IDL.Nat64], [IDL.Text], ['query']),
    'icrc1_supported_standards' : IDL.Func(
      [IDL.Nat64],
      [IDL.Vec(Icrc1supportedStandardsResult)],
      ['query'],
    ),
    'icrc1_symbol' : IDL.Func([IDL.Nat64], [IDL.Text], ['query']),
    'icrc1_total_supply' : IDL.Func([IDL.Nat64], [IDL.Nat], ['query']),
    'is_post_be_asset' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Nat64)], ['query']),
    'is_posts_be_assets' : IDL.Func(
      [IDL.Vec(IDL.Text)],
      [IDL.Vec(IDL.Opt(IDL.Nat64))],
      ['query'],
    ),
    'remove' : IDL.Func([IDL.Nat64], [Result], []),
    'sell' : IDL.Func([IDL.Nat64, IDL.Nat], [Result], []),
    'update_icp_ca' : IDL.Func([IDL.Principal], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
