import type {Principal} from '@dfinity/principal';
import type {ActorMethod} from '@dfinity/agent';
import type {IDL} from '@dfinity/candid';

export interface Account {
  'owner': Principal,
  'subaccount': [] | [Uint8Array | number[]],
}

export interface AllowanceArgs {
  'account': Account,
  'spender': Account
}

export interface ApproveArgs {
  'fee': [] | [bigint],
  'memo': [] | [Uint8Array | number[]],
  'from_subaccount': [] | [Uint8Array | number[]],
  'created_at_time': [] | [bigint],
  'amount': bigint,
  'expected_allowance': [] | [bigint],
  'expires_at': [] | [bigint],
  'spender': Account,
}

export type ApproveError = {
  'GenericError': { 'message': string, 'error_code': bigint }
} |
  { 'TemporarilyUnavailable': null } |
  { 'Duplicate': { 'duplicate_of': bigint } } |
  { 'BadFee': { 'expected_fee': bigint } } |
  { 'AllowanceChanged': { 'current_allowance': bigint } } |
  { 'CreatedInFuture': { 'ledger_time': bigint } } |
  { 'TooOld': null } |
  { 'Expired': { 'ledger_time': bigint } } |
  { 'InsufficientFunds': { 'balance': bigint } };

export interface Icrc1supportedStandardsResult {
  'url': string,
  'name': string,
}

export type Icrc1transferResult = { 'Ok': bigint } |
  { 'Err': TransferError };

export interface Icrc2allowanceResult {
  'allowance': bigint,
  'expires_at': [] | [bigint],
}

export type Icrc2approveResult = { 'Ok': bigint } |
  { 'Err': ApproveError };
export type Icrc2transferFromResult = { 'Ok': bigint } |
  { 'Err': TransferFromError };
export type Result = { 'Ok': bigint } |
  { 'Err': TokenError };
export type Result_1 = { 'Ok': bigint } |
  { 'Err': TokenError };
export type Result_10 = { 'Ok': Icrc2transferFromResult } |
  { 'Err': TokenError };
export type Result_2 = { 'Ok': number } |
  { 'Err': TokenError };
export type Result_3 = { 'Ok': Array<[string, Value]> } |
  { 'Err': TokenError };
export type Result_4 = { 'Ok': [] | [Account] } |
  { 'Err': TokenError };
export type Result_5 = { 'Ok': string } |
  { 'Err': TokenError };
export type Result_6 = { 'Ok': Array<Icrc1supportedStandardsResult> } |
  { 'Err': TokenError };
export type Result_7 = { 'Ok': Icrc1transferResult } |
  { 'Err': TokenError };
export type Result_8 = { 'Ok': Icrc2allowanceResult } |
  { 'Err': TokenError };
export type Result_9 = { 'Ok': Icrc2approveResult } |
  { 'Err': TokenError };
export type TokenError = { 'Unauthorized': null } |
  { 'TokenNotExist': null };

export interface TokenInitArgs {
  'fee': bigint,
  'decimals': number,
  'init_balances': Array<[Principal, bigint]>,
  'name': string,
  'symbol': string,
  'mintint_account': [] | [Account],
}

export interface TransferArgs {
  'to': Account,
  'fee': [] | [bigint],
  'memo': [] | [Uint8Array | number[]],
  'from_subaccount': [] | [Uint8Array | number[]],
  'created_at_time': [] | [bigint],
  'amount': bigint,
}

export type TransferError = {
  'GenericError': { 'message': string, 'error_code': bigint }
} |
  { 'TemporarilyUnavailable': null } |
  { 'BadBurn': { 'min_burn_amount': bigint } } |
  { 'Duplicate': { 'duplicate_of': bigint } } |
  { 'BadFee': { 'expected_fee': bigint } } |
  { 'CreatedInFuture': { 'ledger_time': bigint } } |
  { 'TooOld': null } |
  { 'InsufficientFunds': { 'balance': bigint } };

export interface TransferFromArgs {
  'to': Account,
  'fee': [] | [bigint],
  'spender_subaccount': [] | [Uint8Array | number[]],
  'from': Account,
  'memo': [] | [Uint8Array | number[]],
  'created_at_time': [] | [bigint],
  'amount': bigint,
}

export type TransferFromError = {
  'GenericError': { 'message': string, 'error_code': bigint }
} |
  { 'TemporarilyUnavailable': null } |
  { 'InsufficientAllowance': { 'allowance': bigint } } |
  { 'BadBurn': { 'min_burn_amount': bigint } } |
  { 'Duplicate': { 'duplicate_of': bigint } } |
  { 'BadFee': { 'expected_fee': bigint } } |
  { 'CreatedInFuture': { 'ledger_time': bigint } } |
  { 'TooOld': null } |
  { 'InsufficientFunds': { 'balance': bigint } };
export type Value = { 'Int': bigint } |
  { 'Nat': bigint } |
  { 'Blob': Uint8Array | number[] } |
  { 'Text': string };

export interface _SERVICE {
  'burn': ActorMethod<[bigint, Principal, bigint], boolean>,
  'create': ActorMethod<[TokenInitArgs], Result>,
  'get_holders': ActorMethod<[bigint], Array<[Principal, bigint]>>,
  'icrc1_balance_of': ActorMethod<[bigint, Account], Result_1>,
  'icrc1_decimals': ActorMethod<[bigint], Result_2>,
  'icrc1_fee': ActorMethod<[bigint], Result_1>,
  'icrc1_metadata': ActorMethod<[bigint], Result_3>,
  'icrc1_minting_account': ActorMethod<[bigint], Result_4>,
  'icrc1_name': ActorMethod<[bigint], Result_5>,
  'icrc1_supported_standards': ActorMethod<[bigint], Result_6>,
  'icrc1_symbol': ActorMethod<[bigint], Result_5>,
  'icrc1_total_supply': ActorMethod<[bigint], Result_1>,
  'icrc1_transfer': ActorMethod<[bigint, TransferArgs], Result_7>,
  'icrc2_allowance': ActorMethod<[bigint, AllowanceArgs], Result_8>,
  'icrc2_approve': ActorMethod<[bigint, ApproveArgs], Result_9>,
  'icrc2_transfer_from': ActorMethod<[bigint, TransferFromArgs], Result_10>,
  'mint': ActorMethod<[bigint, Principal, bigint], boolean>,
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
