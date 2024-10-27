import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/Index/index.did";
import {
  GetAccountIdentifierTransactionsResponse,
  GetAccountIdentifierTransactionsResult,
  GetAccountTransactionsArgs
} from "../declarations/Index";
import {getActor2} from "../utils/Actor2";
import {CommonStore} from "../utils/Store";


const indexCai = "qhbym-qaaaa-aaaaa-aaafq-cai"
export default class IndexCai {

  private async getActor() {
    const agent = CommonStore.getAgent()
    return await getActor2.createActor(idlFactory, indexCai, agent);
  }

  async getTx(who: Principal): Promise<GetAccountIdentifierTransactionsResponse> {
    const actor = await this.getActor()
    try {
      const arg: GetAccountTransactionsArgs = {
        max_results: BigInt(100),
        start: [],
        account: {
          owner: who,
          subaccount: []
        }
      }
      const res = await actor.get_account_transactions(arg) as GetAccountIdentifierTransactionsResult
      if ("Ok" in res) {
        return res.Ok
      }
      throw new Error(res.Err.message)
    } catch (e) {
      console.log("get_account_transactions", e)
      throw e
    }

  }

}

export const indexApi = new IndexCai()
