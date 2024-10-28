import {idlFactory} from "../declarations/root_bucket/root_bucket.did.js"
import {Post} from "../declarations/root_bucket/root_bucket";
import {getActor} from "../utils/Actor";

const root_bucket = "pc5ag-oiaaa-aaaan-qmthq-cai"

class rootPost {

  static async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, root_bucket);
  }

  async get_buckets_latest_feed_from_start(start: number, count: number) {
    const actor = await rootPost.getNoIdentityActor()
    try {
      return await actor.get_buckets_latest_feed_from_start(BigInt(start), BigInt(count)) as Post[]
    } catch (e) {
      throw e
    }
  }
}

export const rootPostApi = new rootPost()
