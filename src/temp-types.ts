
import { FosContext } from './fosContext';
import { FosNode } from './fosNode';

export type FosNodeContent = {
  description: string;
  data: {
    duration?: {
      marginal: number
    } ;
    cost?: {
      budget?: {
        available: number;
      }
      marginal: number
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
    }
  },
  content: [string, string][];
}

export type FosNodeData = {
  selectedOption: number;
  description: string;
  collapsed: boolean;
  mergeNode?: string;
  options: [FosNodeContent, ...FosNodeContent[]]
}


export type SelectionPath = {
  [key: number]: SelectionPath[]
}



export type FosTrail = [[string, string], ...[string, string][]]
export type FosPath = [string, string][]
export type FosRoute = [[string, string], ...[string, string][]]

export type FosNodesData = { [key: string]: FosNodeData }

export type FosContextData = { 
  nodes: FosNodesData,
  trail: FosTrail,
  focus: {
    route: FosRoute,
    char: number
  },
  previousHash: string
}


export {
  FosContext,
  FosNode
}