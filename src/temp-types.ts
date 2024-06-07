
import { FosContext } from './fosContext';
import { FosNodeBase } from './fosNodeBase';
import { FosPeer, IFosPeer } from './fosPeer';
import { IFosNode } from './fosNodeBase';

export type FosDataContent = {
  duration?: {
    plannedMarginal: number;
    entries: {
      start: number;
      stop: number;
      notes: string;
    }[]
  };
  cost?: {
    budget?: {
      available: number;
    }
    plannedMarginal: number;
    entries: {
      time: number;
      amount: number;
    }[]
  };
  probability?: {
    marginSuccess: number;
    marginFailure: number;
  };
  document?: {
    content: string;
  };
  resources?: {
    required: string[];
    available: string[];
    produced: string[];
  }
  option?: {
    selectedIndex: number;
  }
  description?: {
    content: string;
  }
  todo?: {
    completed: boolean;
    notes: string;
  }
  reactClient?:{
    collapsed: boolean;
  }
}



export type FosNodeContent = {
  data: FosDataContent,
  content: [string, string][];
}

// export type FosNodeData = {
//   selectedOption: number;
//   description: string;
//   collapsed: boolean;
//   mergeNode?: string;
//   options: [FosNodeContent, ...FosNodeContent[]]
// }


export type SelectionPath = {
  [key: number]: SelectionPath[]
}

export type NodeAddress = string
export type ContentId = string
export type NodeId  = NodeAddress | ContentId

export type RouteElement = [NodeId, NodeId] 

export type FosTrail = [[string, string], ...[string, string][]]
export type FosPath = [string, string][]
export type FosRoute = [[string, string], ...[string, string][]]

export type FosNodesData = { [key: string]: FosNodeContent }

export type FosContextData = { 
  nodes: FosNodesData,
  trail: FosTrail,
  focus: {
    route: FosRoute,
    char: number
  },
  previousHash: string
}

export type {
  IFosPeer,
  IFosNode
}

export {
  FosContext,
  FosNodeBase,
  FosPeer,
}