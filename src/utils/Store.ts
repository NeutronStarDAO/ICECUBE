import {Agent} from "@dfinity/agent";


type props = {
  agent?: Agent
}

class CStore {
  private common: props = {
    agent: undefined
  };

  actionSave(store: props) {
    this.common = {...store}
  }

  getAgent(): Agent | undefined {
    return this.common.agent
  }

}

export const CommonStore = new CStore();
