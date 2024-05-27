import { NoContextNode } from "./node";
import { IStore, INode } from "..";




export const getTerminalNode = (store: IStore) => {
  const terminalNode = store.create([])
  return terminalNode
}

export const getUnitNode = (store: IStore) => {
  const terminalNode = getTerminalNode(store)
  const unitNode = store.create([[terminalNode.getAddress(), terminalNode.getAddress()]])
  return unitNode
}

export const getAllOfNode = (store: IStore) => {
  const unitNode = getUnitNode(store)
  const allOfNode = store.create([[unitNode.getAddress(), unitNode.getAddress()]])
  return allOfNode
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

export const getNameNode = (store: IStore) => {
  const terminalNode = getTerminalNode(store)
  const unitNode = getUnitNode(store)
  const nameNode = store.create([[terminalNode.getAddress(), unitNode.getAddress()]])
  return nameNode
}

export const getNthDepNodeWithPattern = (store: IStore, n: number, pattern: INode) => {
  if (n < 0) throw new Error('cannot get negative dep')

}


export const getRootInstructionNode = (store: IStore) => {

}

export const getNthCommentInstructionNode = (store: IStore) => {


}

export const getWorkflowInstructionNode = (store: IStore) => {

}

export const constructAliases = (store: IStore) => Object.entries({
  terminal: getTerminalNode(store).getAddress(),
  id: getIdNode(store).getAddress(),
  nothing: getNothingNode(store).getAddress(),
  unit: getUnitNode(store).getAddress(),
  allOf: getAllOfNode(store).getAddress(),
})
