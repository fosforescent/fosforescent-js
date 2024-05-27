import { IStore, INode, IFosInterpreter} from "../types";

interface IPeer {

}


export type PeerOptions = {
  type: 'webrtc' 
} | {
  type: 'websocket'
} | {
  type: 'http'
} | {
  type: 'js'
}



class Peer implements IPeer {

  rootsHistory: string[] = [] 
  nodeRequests: [string, [string, string][]][] = []
  // proposals: Proposal[] = [] 


  constructor(public store: IStore) {

  }

  pullFromRemote() {

  }

  relayProposalToRemote() {

  }

  relayNodeRequestToRemote() {

  }

  relayNodeToRemote() {

  }





}