import {Principal} from "@dfinity/principal";
import {Account, Result, SendArgs, TransferArg} from "../declarations/Ledger/ledger";
import {idlFactory} from "../declarations/Ledger/ledger.did";
import {getActor} from "../utils/Actor";
import {CommonStore} from "../utils/Store";


const ledgerCai = "ryjl3-tyaaa-aaaaa-aaaba-cai"
export default class Ledger {

  private async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, ledgerCai);
  }

  private async getActor() {
    return await getActor.createActor(idlFactory, ledgerCai);
  }

  async icpBalance(who: Principal) {
    const actor = await this.getNoIdentityActor()
    try {
      const account: Account = {
        owner: who,
        subaccount: []
      }
      const res = await actor.icrc1_balance_of(account) as bigint
      return res
    } catch (e) {
      console.log("icp_balance error", e)
      throw e
    }
  }

  async transferUsePrincipal(to: Principal, amount: bigint): Promise<bigint> {
    const actor = await this.getActor()
    try {
      const arg: TransferArg = {
        to: {owner: to, subaccount: []},
        amount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: []
      }
      const res = await actor.icrc1_transfer(arg) as Result
      if ("Ok" in res) {
        return res.Ok
      }
      throw new Error(Object.keys(res.Err)[0])
    } catch (e) {
      console.log("transferUsePrincipal error", e)
      throw e
    }
  }

  async transferUseAccount(to: string, amount: bigint): Promise<bigint> {
    const actor = await this.getActor()
    try {
      const arg: SendArgs = {
        to,
        amount: {e8s: amount},
        fee: {e8s: BigInt(10000)},
        memo: BigInt(0),
        from_subaccount: [],
        created_at_time: []
      }
      return await actor.send_dfx(arg) as bigint
    } catch (e) {
      console.log("transferUseAccount error", e)
      throw e
    }
  }
}

export const ledgerApi = new Ledger()
