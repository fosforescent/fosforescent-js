// utils/fosUtils.ts

import { FosNodeData, FosNodeContent, FosRoute, FosTrail, FosNodesData } from '.';
import { FosContext } from './fosContext';
import { FosNode } from './fosNode';
import { diffChars, diffArrays, ArrayChange, Change } from 'diff';

export function parseIndex(activeOptionIndex: number | null, selectedOption: number, index?: number): number {
  return index === undefined ? (activeOptionIndex !== null ? activeOptionIndex : selectedOption) : index;
}

export function updateNodeOptionData(context: FosContext, route: FosRoute, newContent: FosNodeContent | null, index?: number): FosNodeData {
  const node = context.getNode(route);
  const indexToUpdate = parseIndex(node.activeOptionIndex, node.getNodeData().selectedOption, index);

  const nodeData = node.getNodeData();
  const optionsStart = nodeData.options.slice(0, indexToUpdate);
  const optionsEnd = nodeData.options.slice(indexToUpdate + 1);
  const newOptions = optionsStart.concat(newContent ? [newContent] : []).concat(optionsEnd) as [FosNodeContent, ...FosNodeContent[]];

  return {
    ...nodeData,
    options: newOptions,
  };
}

export function getChildren(context: FosContext, route: FosRoute, index?: number): FosNode[] {
  const node = context.getNode(route);
  const indexToGet = parseIndex(node.activeOptionIndex, node.getNodeData().selectedOption, index);
  const data: FosNodeContent = node.getOptionContent(indexToGet);

  return data.content.map(([type, id]) => {
    const newRoute = node.route.concat([[type, id]]) as FosRoute;
    return context.getNode(newRoute);
  });
}

export function getParent(node: FosNode, nthGen: number): [FosNode, number, number] {
  if (nthGen > node.route.length) {
    throw new Error(`node does not have ${nthGen} ancestors`);
  }

  if (nthGen === 1) {
    const newRoute = node.route.slice(0, node.route.length - nthGen) as FosRoute;
    const parentNode = node.context.getNode(newRoute);

    parentNode.activeOptionIndex = parentNode.getNodeData().selectedOption;
    parentNode.getChildren().forEach((child: FosNode, index: number) => {
      if (child.getNodeId() === node.getNodeId() && child.getNodeType() === node.getNodeType()) {
        parentNode.activeRowIndex = index;
      }
    });

    if (parentNode.activeRowIndex === null) {
      throw new Error(`could not find child in parent`);
    }

    if (!parentNode.activeOptionIndex){
      throw new Error(`could not find active option index in parent`);
    }
    return [parentNode, parentNode.activeRowIndex, parentNode.activeOptionIndex ];
  } else {
    const [parent] = getParent(node, nthGen - 1);
    return getParent(parent, 1);
  }
}

// export function diffIsClose<T>(diffArray: ArrayChange<T>[] | Change[]): boolean {
//   if (!Array.isArray(diffArray)) {
//     throw new Error('diff array is empty');
//   }

//   console.log(diffArray);
//   const { total, changed } = diffArray.reduce(
//     (acc: { total: number; changed: number }, change: ArrayChange<T> | Change) => ({
//       total: acc.total + 1,
//       changed: acc.changed + (change.added || change.removed ? 1 : 0),
//     }),
//     { total: 0, changed: 0 }
//   );

//   return changed / total < 0.5;
// }

export const nodeReduce = <T, S>(
  thisNode: FosNode, 
  aggOr: <T>(acc: T, item: FosNodeContent, index: number) => T, 
  aggAnd: <T>(acc: T, item: FosNode, index: number) => T, 
  acc: T, 
  index?: number 
): T => {
  const indexToGet = thisNode.parseIndex(index);
  const children = thisNode.getChildren(indexToGet);

  if (children.length === 0) {
    return acc;
  } else {
    // Aggregate through each child node
    return children.reduce((andAgg: T, andChild: FosNode, i: number) => {
      const childData = andChild.getNodeData();
      const childOptions = childData.options;

      // Recursive call to nodeReduce for the current child
      const childAgged: T = nodeReduce(andChild, aggOr, aggAnd, andAgg, index);

      // Apply the aggOr reducer to each option of the child
      const orAgged: T = childOptions.reduce((orAgg: T, orChild: FosNodeContent, j: number) => {
        return aggOr<T>(orAgg, orChild, j);
      }, childAgged);


      // Apply the aggAnd reducer to the aggregated result and the current child
      return aggAnd(orAgged, andChild, i);
    }, acc);
  }
};

