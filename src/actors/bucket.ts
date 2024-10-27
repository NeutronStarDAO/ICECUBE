import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/bucket/bucket.did.js";
import {Post} from "../declarations/bucket/bucket";
import {getActor2} from "../utils/Actor2";
import {CommonStore} from "../utils/Store";


export default class Bucket {

  private readonly canisterId: Principal;

  constructor(canisterId: Principal) {
    this.canisterId = canisterId;
  }

  private async getActor() {
    const agent = CommonStore.getAgent()
    return await getActor2.createActor(idlFactory, this.canisterId.toString(), agent);
  }

  async getLatestFeed(n: number) {
    const actor = await this.getActor()
    try {
      return await actor.get_latest_feed(BigInt(n)) as Post[]
    } catch (e) {
      console.log("getLatestFeed", e)
      throw e
    }
  }

  async getPostNumber() {
    const actor = await this.getActor()
    try {
      const res = await actor.get_post_number() as bigint
      console.log(res)
    } catch (e) {
      console.log("getPostNumber", e)
      throw e
    }
  }

}
