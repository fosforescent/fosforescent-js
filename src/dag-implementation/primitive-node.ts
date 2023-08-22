import { NoContextNode } from "./node";
import { IStore, INode } from "..";


export const getTerminalNode = (store: IStore) => {
  const terminalNode = store.create([])
  return terminalNode
}

export const getIdNode = (store: IStore) => {
  const idNode = store.create((node: INode) => node)
  return idNode
}

export const getNothingNode = (store: IStore) => {
  const terminalNode = getTerminalNode(store)
  const nothingNode = store.create((node: INode) => terminalNode)
  return nothingNode
}

export const getNthDepNodeWithPattern = (store: IStore, n: number, pattern: INode) => {
  if (n < 0) throw new Error('cannot get negative dep')

}

export const getEffectNode = (effect: (node: INode) => Promise<INode>) => {
  

}