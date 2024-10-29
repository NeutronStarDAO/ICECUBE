import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/test_icp/index.did";
import {Account, ApproveArgs} from "../declarations/test_icp";
import {CommonStore} from "../utils/Store";
import {getActor} from "../utils/Actor";

const cid = "ryjl3-tyaaa-aaaaa-aaaba-cai"
export default class Test_icp {

  private async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, cid);
  }

  private async getActor() {
    return await getActor.createActor(idlFactory, cid);
  }


  mint(to: Principal, amount: number) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.mint(to, BigInt(Math.floor(amount * 1e8))) as boolean
        console.log("mint", result)
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

  icrc1_balance_of(who: Principal) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const account: Account = {
          owner: who,
          subaccount: []
        }
        const actor = await this.getNoIdentityActor()
        const result = await actor.icrc1_balance_of(account) as bigint
        resolve(Number(result))
      } catch (e) {
        reject(e)
      }
    })
  }

  icrc2_approve(amount: bigint, who: Principal) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const arg: ApproveArgs = {
          fee: [],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          amount,
          expected_allowance: [],
          expires_at: [],
          spender: {
            owner: who,
            subaccount: []
          }
        }
        const actor = await this.getActor()
        const result = await actor.icrc2_approve(arg) as boolean
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })

  }

}

export const test_icp_api = new Test_icp()
