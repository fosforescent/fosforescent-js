import { FosNodeData, FosNodeContent, FosRoute } from '.';
import { FosContext } from './fosContext';
import { FosNode } from './fosNode';
export declare function parseIndex(activeOptionIndex: number | null, selectedOption: number, index?: number): number;
export declare function updateNodeOptionData(context: FosContext, route: FosRoute, newContent: FosNodeContent | null, index?: number): FosNodeData;
export declare function getChildren(context: FosContext, route: FosRoute, index?: number): FosNode[];
export declare function getParent(node: FosNode, nthGen: number): [FosNode, number, number];
export declare const nodeReduce: <T, S>(thisNode: FosNode, aggOr: <T_1>(acc: T_1, item: FosNodeContent, index: number) => T_1, aggAnd: <T_2>(acc: T_2, item: FosNode, index: number) => T_2, acc: T, index?: number) => T;
