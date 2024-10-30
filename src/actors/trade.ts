import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/trade/index.did";
import {Asset, Result, Result_1, TradeEvent} from "../declarations/trade";
import type {Principal} from "@dfinity/principal";

export const tradeCid = "r4b4l-baaaa-aaaan-qzngq-cai"
class Trade {

  private async getActor() {
    return await getActor.createActor(idlFactory, tradeCid);
  }

  private async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, tradeCid);
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

  get_buy_price_after_fee(assetId: bigint, tokenAmount: bigint) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_buy_price_after_fee(assetId, tokenAmount) as bigint
        resolve(Number(result))
      } catch (e) {
        reject(e)
      }
    })
  }

  get_sell_price(assetId: bigint, tokenAmount: bigint) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_sell_price(assetId, tokenAmount) as bigint
        resolve(Number(result))
      } catch (e) {
        reject(e)
      }
    })
  }

  get_sell_price_after_fee(assetId: bigint, tokenAmount: bigint) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_sell_price_after_fee(assetId, tokenAmount) as bigint
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

  icrc1_total_supply(assetId: bigint) {
    return new Promise<bigint>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.icrc1_total_supply(assetId) as bigint
        resolve(result)
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

  buy(assetId: bigint, tokenAmount: bigint) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const actor = await this.getActor()
        const result = await actor.buy(assetId, tokenAmount) as Result
        console.log(result)
        if ("Ok" in result) {
          resolve(true)
        } else {
          reject(Object.keys(result.Err)[0])
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  sell(assetId: bigint, tokenAmount: bigint) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const actor = await this.getActor()
        const result = await actor.sell(assetId, tokenAmount) as Result
        console.log(result)
        if ("Ok" in result) {
          resolve(true)
        } else {
          reject(Object.keys(result.Err)[0])
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  get_holdings(who: Principal) {
    return new Promise<Array<[bigint, bigint]>>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.get_holdings(who) as Array<[bigint, bigint]>
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

  icrc1_balance_of(tokenId: bigint, who: Principal) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.icrc1_balance_of(tokenId, who) as bigint
        resolve(Number(result))
      } catch (e) {
        reject(e)
      }
    })
  }

  batch_get_asset(assetIds: bigint[]) {
    return new Promise<Array<[] | [Asset]>>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor()
        const result = await actor.batch_get_asset(assetIds) as Array<[] | [Asset]>
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

}

export const tradeApi = new Trade()
