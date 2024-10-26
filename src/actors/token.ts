import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/token/index.did";
import {Principal} from "@dfinity/principal";
import {Account, Result_1} from "../declarations/token";

const cid = "rvcxx-xiaaa-aaaan-qznha-cai"
export default class Token {

  private async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, cid);
  }

  private async getActor() {
    return await getActor.createActor(idlFactory, cid);
  }

  icrc1_balance_of(tokenId: bigint, who: Principal) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const ac: Account = {
          owner: who,
          subaccount: []
        }
        const actor = await this.getNoIdentityActor()
        const result = await actor.icrc1_balance_of(tokenId, ac) as Result_1
        if ("Ok" in result) {
          resolve(Number(result.Ok))
        } else {
          reject(result.Err)
        }
      } catch (e) {
        reject(e)
      }
    })
  }

}

export const token_api = new Token()
