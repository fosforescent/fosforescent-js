import { FosNodeData, FosNodeContent, FosRoute, SelectionPath } from '.';
import { FosContext } from './fosContext';
import { ArrayChange, Change } from 'diff';
export declare class FosNode {
    context: FosContext;
    route: FosRoute;
    activeOptionIndex: number | null;
    activeRowIndex: number | null;
    constructor(context: FosContext, route: FosRoute);
    parseIndex(index?: number): number;
    getNodeId(): string;
    getNodeType(): string;
    getRoute(): FosRoute;
    getNodeData(): FosNodeData;
    setNodeData(newData: FosNodeData): FosContext;
    setNodeOptionData(index: number, newContent: FosNodeContent): FosContext;
    getOptionContent(index?: number): FosNodeContent;
    updateOptionData(newContent: FosNodeContent | null, index?: number): FosNodeData;
    updateNodeData(newData: FosNodeData): FosContext;
    getChildren(index?: number): FosNode[];
    isChildOf(parent: FosNode): boolean;
    /**
     * @param nthGen number of generations to go up
     * @returns [node: FosNode, childIndex: number, optionIndex: number]
     */
    getParent(nthGen: number): [FosNode, number, number];
    addOption(): FosContext;
    deleteOption(index: number): FosContext;
    deleteRowByIndex(rowIndex: number, optionIndex?: number): FosNodeData;
    deleteNode(): FosContext;
    moveFocusUp(charpos?: number): FosContext | undefined;
    moveFocusDown(ignoreChildren?: boolean): FosContext | undefined;
    getLastDescendent(visibleOnly?: boolean): FosNode;
    acceptMerge(): FosContext;
    rejectMerge(): FosContext;
    bothMerge(): FosContext;
    getMergeOptions(): {
        description: Change[];
        content: ArrayChange<[string, string]>[];
    }[];
    hasMerge(): boolean;
    getMergedIndex(): number;
    getMergeChildren(index?: number): {
        added?: boolean | undefined;
        removed?: boolean | undefined;
        node: FosNode;
    }[];
    mergeNodeData(): FosNodeData;
    mergeNodeContent(): FosNodeContent;
    setPath(selectionPath: SelectionPath): FosContext;
    setData(data: Partial<FosNodeContent["data"]>, index?: number): FosContext;
    getData(index?: number): {
        duration?: {
            marginal: number;
        } | undefined;
        cost?: {
            budget?: {
                available: number;
            } | undefined;
            marginal: number;
        } | undefined;
        probability?: {
            marginSuccess: number;
            marginFailure: number;
        } | undefined;
        document?: {
            content: string;
        } | undefined;
        resources?: {
            required: string[];
            available: string[];
        } | undefined;
    };
}
