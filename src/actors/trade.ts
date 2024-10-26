import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/trade/index.did";
import {Asset, Result_1, TradeEvent} from "../declarations/trade";
import type {Principal} from "@dfinity/principal";

const cid = "r4b4l-baaaa-aaaan-qzngq-cai"
export default class Trade {

  private async getActor() {
    return await getActor.createActor(idlFactory, cid);
  }

  private async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, cid);
  }

  create(postId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const actor = await this.getActor()
        const result = await actor.create(postId) as Result_1
        if ("Ok" in result) {
          resolve(result.Ok)
        } else {
          reject(result.Err)
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  get_asset_entries_by_len(start: number, len: number) {
    return new Promise<Asset[]>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_asset_entries_by_len(BigInt(start), BigInt(len)) as Asset[]
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

  is_post_be_asset(post: string) {
    return new Promise<bigint>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.is_post_be_asset(post) as bigint[]
        if (result.length > 0)
          resolve(result[0])
        else reject("not found")
      } catch (e) {
        reject(e)
      }
    })
  }

  is_posts_be_assets(posts: string[]) {
    return new Promise<Array<[] | [bigint]>>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.is_posts_be_assets(posts) as Array<[] | [bigint]>
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

  get_buy_price(assetId: bigint, tokenAmount: bigint) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_buy_price(assetId, tokenAmount) as bigint
        resolve(Number(result))
      } catch (e) {
        reject(e)
      }
    })
  }

  get_recent_trade(id: bigint) {
    return new Promise<TradeEvent[]>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_recent_trade(id) as TradeEvent[]
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

  get_pool_value(assetId: bigint) {
    return new Promise<bigint>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_pool_value(assetId) as bigint[]
        if (result.length > 0)
          resolve(result[0])
        else resolve(BigInt(0))
      } catch (e) {
        reject(e)
      }
    })
  }

  get_share_supply(assetId: bigint) {
    return new Promise<bigint>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_share_supply(assetId) as bigint[]
        if (result.length > 0)
          resolve(result[0])
        else resolve(BigInt(0))
      } catch (e) {
        reject(e)
      }
    })
  }

  get_holders(assetId: bigint) {
    return new Promise<Array<[Principal, bigint]>>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_holders(assetId) as Array<[Principal, bigint]>
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

  get_asset(assetId: bigint) {
    return new Promise<Asset>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_asset(assetId) as Asset[]
        if (result.length > 0)
          resolve(result[0])
        else reject("not found")
      } catch (e) {
        reject(e)
      }
    })
  }
}

export const tradeApi = new Trade()
