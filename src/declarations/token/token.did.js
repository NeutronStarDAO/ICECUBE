export const idlFactory = ({ IDL }) => {
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const TokenInitArgs = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'init_balances' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'name' : IDL.Text,
    'symbol' : IDL.Text,
    'mintint_account' : IDL.Opt(Account),
  });
  const TokenError = IDL.Variant({
    'Unauthorized' : IDL.Null,
    'TokenNotExist' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : TokenError });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : TokenError });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Nat8, 'Err' : TokenError });
  const Value = IDL.Variant({
    'Int' : IDL.Int,
    'Nat' : IDL.Nat,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
  });
  const Result_3 = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Tuple(IDL.Text, Value)),
    'Err' : TokenError,
  });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Opt(Account), 'Err' : TokenError });
  const Result_5 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : TokenError });
  const Icrc1supportedStandardsResult = IDL.Record({
    'url' : IDL.Text,
    'name' : IDL.Text,
  });
  const Result_6 = IDL.Variant({
    'Ok' : IDL.Vec(Icrc1supportedStandardsResult),
    'Err' : TokenError,
  });
  const TransferArgs = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
  });
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const Icrc1transferResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : TransferError,
  });
  const Result_7 = IDL.Variant({
    'Ok' : Icrc1transferResult,
    'Err' : TokenError,
  });
  const AllowanceArgs = IDL.Record({
    'account' : Account,
    'spender' : Account,
  });
  const Icrc2allowanceResult = IDL.Record({
    'allowance' : IDL.Nat,
    'expires_at' : IDL.Opt(IDL.Nat64),
  });
  const Result_8 = IDL.Variant({
    'Ok' : Icrc2allowanceResult,
    'Err' : TokenError,
  });
  const ApproveArgs = IDL.Record({
    'fee' : IDL.Opt(IDL.Nat),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
    'expected_allowance' : IDL.Opt(IDL.Nat),
    'expires_at' : IDL.Opt(IDL.Nat64),
    'spender' : Account,
  });
  const ApproveError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'AllowanceChanged' : IDL.Record({ 'current_allowance' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'Expired' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const Icrc2approveResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : ApproveError,
  });
  const Result_9 = IDL.Variant({
    'Ok' : Icrc2approveResult,
    'Err' : TokenError,
  });
  const TransferFromArgs = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'spender_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
  });
  const TransferFromError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const Icrc2transferFromResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : TransferFromError,
  });
  const Result_10 = IDL.Variant({
    'Ok' : Icrc2transferFromResult,
    'Err' : TokenError,
  });
  return IDL.Service({
    'burn' : IDL.Func([IDL.Nat64, IDL.Principal, IDL.Nat64], [IDL.Bool], []),
    'create' : IDL.Func([TokenInitArgs], [Result], []),
    'get_holders' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['query'],
      ),
    'icrc1_balance_of' : IDL.Func([IDL.Nat64, Account], [Result_1], ['query']),
    'icrc1_decimals' : IDL.Func([IDL.Nat64], [Result_2], ['query']),
    'icrc1_fee' : IDL.Func([IDL.Nat64], [Result_1], ['query']),
    'icrc1_metadata' : IDL.Func([IDL.Nat64], [Result_3], ['query']),
    'icrc1_minting_account' : IDL.Func([IDL.Nat64], [Result_4], ['query']),
    'icrc1_name' : IDL.Func([IDL.Nat64], [Result_5], ['query']),
    'icrc1_supported_standards' : IDL.Func([IDL.Nat64], [Result_6], ['query']),
    'icrc1_symbol' : IDL.Func([IDL.Nat64], [Result_5], ['query']),
    'icrc1_total_supply' : IDL.Func([IDL.Nat64], [Result_1], ['query']),
    'icrc1_transfer' : IDL.Func([IDL.Nat64, TransferArgs], [Result_7], []),
    'icrc2_allowance' : IDL.Func(
        [IDL.Nat64, AllowanceArgs],
        [Result_8],
        ['query'],
      ),
    'icrc2_approve' : IDL.Func([IDL.Nat64, ApproveArgs], [Result_9], []),
    'icrc2_transfer_from' : IDL.Func(
        [IDL.Nat64, TransferFromArgs],
        [Result_10],
        [],
      ),
    'mint' : IDL.Func([IDL.Nat64, IDL.Principal, IDL.Nat64], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
