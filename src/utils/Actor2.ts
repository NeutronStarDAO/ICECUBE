import {Actor,  HttpAgent} from "@dfinity/agent";
import {CommonStore} from "./Store";

class UserActor2 {

  async getNoIdentityAgent() {
    return new HttpAgent({
      host: "https://ic0.app"
    });
  }

  public async createActor(idlFactory: any, canisterId: string | any) {
    const agent = CommonStore.getAgent()
    await agent?.fetchRootKey()
    return Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }

  public async noIdentityActor(IdlFactory: any, canisterId: string) {
    const agent = await this.getNoIdentityAgent();
    await agent.fetchRootKey()
    return Actor.createActor(IdlFactory, {
      agent,
      canisterId,
    });
  }
}

export const getActor2 = new UserActor2()
