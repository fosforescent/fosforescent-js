import { IStore } from "../dag-implementation/types";
import { IFosInterpreter } from "../interpreter/types";

interface IPeer {

}

class Peer implements IPeer {


  constructor(public store: IStore, pub) {

  }

  setRoot (root: IFosInterpreter): void {
    console.log('rootsHistory - s', this.rootsHistory)
    // console.trace()
    const newAddress = root.getTarget()
    if (this.rootsHistory[0] === newAddress) {
      return
      // throw new Error('root already set to this address')
    }
    this.rootsHistory.unshift(root.getTarget())
    console.log('rootsHistory - e', this.rootsHistory)
  }




}