import { FosContextData } from "./temp-types";

export interface IFosPeer {
  pushToPeer: (data: FosContextData) => Promise<void>;
  pullFromPeer: () => Promise<FosContextData | undefined>;
}



type FosPeerData = {
  pushToRemote: (data: FosContextData) => Promise<void>
  pullFromRemote: () => Promise<FosContextData | undefined>
  pushCondition: (data: FosContextData) => Promise<boolean>
  pullCondition: (data: FosContextData) => Promise<boolean>
  data: FosContextData | undefined
  mergeData: (newData: FosContextData, baseData: FosContextData) => FosContextData
}


export class FosPeer implements IFosPeer{

  values: Omit<FosPeerData, "data">
  data: FosContextData | undefined

  constructor({
    pushToRemote,
    pullFromRemote,
    pushCondition,
    pullCondition,
    data = undefined,
    mergeData
  }: FosPeerData
  ) {
    this.values = {
      pushToRemote,
      pullFromRemote,
      pushCondition,
      pullCondition,
      mergeData
    }
    this.data = data
  }


  async pushToPeer(data: FosContextData) {
    if (this.data){
      this.data = this.values.mergeData(data, this.data)
    } else {
      this.data = data;
    }
    if (await this.values.pushCondition(this.data)) {
      return await this.values.pushToRemote(this.data);
    }
  }

  async pullFromPeer() {
    if (this.data ? await this.values.pullCondition(this.data) : true) {
      const data = await this.values.pullFromRemote();
      this.data = data;
      return data;
    }
  }


  static fromContextData(data: FosContextData){
    const pushToRemote = async (newData: FosContextData) => {
      throw new Error("Pushing to Remote for static peer")
    }
    const pullFromRemote = async () => { return data }
    const pushCondition = async (newData: FosContextData) => { return false }
    const pullCondition = async (newData: FosContextData) => { return true }
    const mergeData = (newData: FosContextData, baseData: FosContextData) => { return newData }
    const newPeer = new FosPeer({
      pushToRemote,
      pullFromRemote,
      pushCondition,
      pullCondition,
      data,
      mergeData
    })
    return newPeer
  }

}