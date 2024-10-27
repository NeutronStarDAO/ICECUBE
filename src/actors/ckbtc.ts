import {idlFactory} from "../declarations/ckBTC/ckbtc.did";
import {Principal} from "@dfinity/principal";
import {Account, Result, TransferArg} from "../declarations/ckBTC/ckbtc";
import {CommonStore} from "../utils/Store";
import {getActor2} from "../utils/Actor2";


const indexCai = "mxzaz-hqaaa-aaaar-qaada-cai"
export default class CkBTC {

  private async getActor() {
    const agent = CommonStore.getAgent()
    return await getActor2.createActor(idlFactory, indexCai, agent);
  }

  private async getNoIdentityActor() {
    return await getActor2.noIdentityActor(idlFactory, indexCai);
  }

  async ckBTCBalance(who: Principal) {
    const actor = await this.getNoIdentityActor()
    try {
      const account: Account = {
        owner: who,
        subaccount: []
      }
      const res = await actor.icrc1_balance_of(account) as bigint
      return res
    } catch (e) {
      console.log("ckBTCBalance error", e)
      throw e
    }
  }

  async transferCkBTC(to: Principal, amount: bigint): Promise<bigint> {
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
      console.log("transferCkBTC error", e)
      throw e
    }

  }

}

export const ckBTCApi = new CkBTC()
