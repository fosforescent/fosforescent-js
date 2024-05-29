import { FosNode } from './fosNode';
export class FosContext {
    data;
    updateData;
    locked = false;
    constructor(data, updateData) {
        this.data = data;
        this.updateData = updateData;
        if (!data.nodes) {
            console.log('FosContext - no nodes', data);
            throw new Error('no nodes');
        }
    }
    setNodes(newNodes, newFocus, newTrail) {
        if (!this.data.nodes) {
            console.log('setNodes - no nodes', this.data);
            throw new Error('no nodes');
        }
        const newData = {
            ...this.data,
            nodes: newNodes,
            focus: newFocus || this.data.focus,
            trail: newTrail || this.data.trail
        };
        // console.log('setNodes - beforeUpdate', newData);
        this.locked = true;
        const contextToReturn = new FosContext(newData, this.updateData);
        this.updateData(newData);
        this.locked = false;
        return contextToReturn;
    }
    setTrail(newTrail) {
        const newData = { ...this.data, trail: newTrail };
        this.updateData(newData);
        return new FosContext(newData, this.updateData);
    }
    setFocus(newRoute, char) {
        const newData = { ...this.data, focus: { route: newRoute, char } };
        this.updateData(newData);
        return new FosContext(newData, this.updateData);
    }
    update() {
        this.updateData(this.data);
    }
    getNode(route) {
        const node = new FosNode(this, route);
        return node;
    }
    setNode(node, nodeData) {
        // console.log('setNode', nodeData);
        const nodeId = node.getNodeId();
        const newNodes = {
            ...this.data.nodes,
            [nodeId]: nodeData
        };
        return this.setNodes(newNodes);
    }
    insertNode(nodeData, route, index) {
        const nodeId = this.newId(nodeData);
        const newNodes = {
            ...this.data.nodes,
            [nodeId]: nodeData
        };
        const newContext = this.setNodes(newNodes);
        return [newContext, nodeId];
    }
    updateNodeAtRoute(route, nodeData) {
        const node = new FosNode(this, route);
        const nodeId = node.getNodeId();
        const newNodes = {
            ...this.data.nodes,
            [nodeId]: nodeData
        };
        return this.setNodes(newNodes);
    }
    updateNodeOptionData(route, nodeContent, index) {
        const node = this.getNode(route);
        // update node selected option
        const newData = node.updateOptionData(nodeContent, index);
        return this.updateNodeAtRoute(route, newData);
    }
    getNodeOptionsAndObj(route) {
        const node = new FosNode(this, route);
        const nodeOptions = node.getNodeData();
        const selectedOption = node.getOptionContent();
        return [nodeOptions, selectedOption, nodeOptions.selectedOption];
    }
    newId(nodeData) {
        // console.log('global', global.crypto, window.crypto, globalThis)
        return crypto.randomUUID();
    }
    addNewTaskToOption(route, contentIndex, optionIndex) {
        const node = this.getNode(route);
        const newNodeData = {
            selectedOption: 0,
            collapsed: false,
            description: "",
            options: [{
                    description: "",
                    data: {},
                    content: [],
                }],
        };
        const newRowId = this.newId(newNodeData);
        const existingContent = node.getOptionContent(optionIndex);
        const newRowIndex = contentIndex === undefined ? existingContent.content.length : contentIndex;
        const existingContentStart = existingContent.content.slice(0, newRowIndex + 1);
        const existingContentEnd = existingContent.content.slice(newRowIndex + 1);
        const pathElem = ['task', newRowId];
        const newRows = existingContentStart.concat([pathElem]).concat(existingContentEnd);
        const newContent = {
            ...existingContent,
            content: newRows
        };
        const newParentData = node.updateOptionData(newContent, optionIndex);
        const parentId = node.getNodeId();
        const newRoute = route.concat([pathElem]);
        const newNodesData = {
            ...this.data.nodes,
            [parentId]: newParentData,
            [newRowId]: newNodeData
        };
        console.log('route', route, newRoute);
        return this.setNodes(newNodesData, { route: newRoute, char: 0 });
    }
    setOptionOnNode(route, optionData, index) {
        const node = this.getNode(route);
        const newNodeData = node.updateOptionData(optionData, index);
        const newContext = this.setNode(node, newNodeData);
        console.log('newNodes', newContext);
        return newContext;
    }
    addOptionToNode(route, nodeOptionData, index) {
        const node = this.getNode(route);
        const newOptionIndex = index === undefined ? node.getNodeData().options.length : index;
        const nodeData = node.getNodeData();
        const newContent = {
            description: "",
            data: {},
            content: [],
            ...nodeOptionData
        };
        const optionsStart = nodeData.options.slice(0, newOptionIndex);
        const optionsEnd = nodeData.options.slice(newOptionIndex);
        const newNodeData = {
            ...nodeData,
            selectedOption: newOptionIndex,
            options: optionsStart.concat([newContent]).concat(optionsEnd)
        };
        const newContext = node.updateNodeData(newNodeData);
        console.log('newNodes', newContext);
        return this.setNodes(newContext.data.nodes);
    }
    moveNodeLeft(route) {
        const thisNode = this.getNode(route);
        const [parentNode, childIndex, parentOptionIndex] = thisNode.getParent(1);
        const [grandParentNode, parentIndex, grandparentOptionIndex] = thisNode.getParent(2);
        const parentRowContent = parentNode.getOptionContent(parentOptionIndex);
        const newParentRows = parentRowContent.content.slice(0, childIndex).concat(parentRowContent.content.slice(childIndex + 1));
        const newParentContent = {
            ...parentRowContent,
            content: newParentRows
        };
        const grandParentRowContent = grandParentNode.getOptionContent(grandparentOptionIndex);
        const grandparentRowsStart = grandParentRowContent.content.slice(0, parentIndex + 1);
        const grandparentRowsEnd = grandParentRowContent.content.slice(parentIndex + 1);
        const newGrandparentRows = grandparentRowsStart.concat([[thisNode.getNodeType(), thisNode.getNodeId()]]).concat(grandparentRowsEnd);
        const newGrandparentContent = {
            ...grandParentRowContent,
            content: newGrandparentRows
        };
        console.log('moveNodeLeft', newGrandparentContent, newParentContent);
        const contextWithNewGrandparent = this.setOptionOnNode(grandParentNode.getRoute(), newGrandparentContent, grandparentOptionIndex);
        const contextWithNewParent = contextWithNewGrandparent.setOptionOnNode(parentNode.getRoute(), newParentContent, parentOptionIndex);
        this.setNodes(contextWithNewParent.data.nodes);
    }
    addYoungerSibling(route) {
        console.log('addYoungerSibling', route);
        const thisNode = this.getNode(route);
        const [parentNode, childIndex, optionIndex] = thisNode.getParent(1);
        const newContext = this.addNewTaskToOption(parentNode.getRoute(), childIndex, optionIndex);
        this.setNodes(newContext.data.nodes, newContext.data.focus, newContext.data.trail);
    }
    moveNodeRight(route) {
        const thisNode = this.getNode(route);
        const [parentNode, childIndex, optionIndex] = thisNode.getParent(1);
        if (childIndex > 0) {
            const olderSibling = parentNode.getChildren(optionIndex)[childIndex - 1];
            const olderSiblingRow = olderSibling.getOptionContent();
            const newContent = olderSiblingRow.content.concat([[thisNode.getNodeType(), thisNode.getNodeId()]]);
            const newOlderSiblingRowData = {
                ...olderSiblingRow,
                content: newContent
            };
            const parentContent = parentNode.getOptionContent(optionIndex);
            const newParentContent = parentContent.content.slice(0, childIndex).concat(parentContent.content.slice(childIndex + 1));
            const newParentRowData = {
                ...parentContent,
                content: newParentContent
            };
            console.log("MoveNodeRight", newParentContent, newContent, newOlderSiblingRowData, newParentRowData);
            const contextWithNewOlderSibling = this.setOptionOnNode(olderSibling.getRoute(), newOlderSiblingRowData);
            const contextWithNewParent = contextWithNewOlderSibling.setOptionOnNode(parentNode.getRoute(), newParentRowData, optionIndex);
            this.setNodes(contextWithNewParent.data.nodes);
        }
        else {
            throw new Error('cannot move right');
        }
    }
    moveNodeUp(route) {
        throw new Error('not implemented');
    }
    moveNodeDown(route) {
        throw new Error('not implemented');
    }
    removeNodeFromParent(route) {
        throw new Error('not implemented');
    }
    deleteOption(route, index) {
        // this.setOptionOnNode(route, null, index)
        throw new Error('not implemented');
    }
    deleteNode(route) {
        throw new Error('not implemented');
    }
    snipNode(route) {
        throw new Error('not implemented');
    }
    deserializeTrailFromUrl(url) {
        const [startOption, ...rest] = url.split('/').filter((s) => s !== "");
        // console.log('deserializeTrailFromUrl - startOption', startOption)
        // console.log('deserializeTrailFromUrl - rest', rest)
        // console.log('deserializeTrailFromUrl - url', url)
        const firstElem = [["root", "root"]];
        const firstNode = this.getNode(firstElem);
        const firstNodeData = firstNode.getNodeData();
        const firstNodeOptions = firstNodeData.options;
        const firstNodeOption = firstNodeOptions[parseInt(startOption || "0")];
        if (!firstNodeOption) {
            throw new Error('firstNodeOption not found');
        }
        // console.log('firstElem', firstElem, firstNodeData, firstNodeOptions, firstNodeOption)
        const trail = rest.reduce((acc, row) => {
            const [rowNumber, optionIndex] = row.split('-').map((s) => parseInt(s));
            if (!rowNumber || isNaN(rowNumber) || !optionIndex || isNaN(optionIndex)) {
                console.log('invalid row', row, url, startOption, rest);
                throw new Error('invalid row');
            }
            const lastNode = this.getNode(acc);
            const lastNodeData = lastNode.getNodeData();
            const [_, foundElem] = lastNodeData.options.reduce((acc, option) => {
                if (rowNumber < option.content.length) {
                    const row = option.content[rowNumber];
                    if (!row) {
                        throw new Error('row not found');
                    }
                    const returnVal = [0, row];
                    return returnVal;
                }
                else {
                    const returnVal = [acc[0] - option.content.length, null];
                    return returnVal;
                }
            }, [rowNumber, null]);
            const newAcc = [...acc, foundElem];
            return newAcc;
        }, firstElem);
        return trail;
    }
    serializeTrailToUrl(trail) {
        const [start, ...rest] = trail;
        const startNodeData = this.getNode([start]).getNodeData();
        const startNodeOption = startNodeData.selectedOption;
        const startString = `${startNodeOption}/`;
        const [restString, _] = rest.reduce((acc, [type, id], index) => {
            const subTrail = [start, ...trail.slice(0, index + 1)];
            const nodeData = this.getNode(subTrail).getNodeData();
            const optionIndex = nodeData.selectedOption;
            const rowNumber = nodeData.options.reduce((acc, option, index) => {
                if (index < optionIndex) {
                    return acc + option.content.length;
                }
                else if (index === optionIndex) {
                    return acc + option.content.findIndex(([type, id]) => type === type && id === id);
                }
                else {
                    return acc;
                }
            }, 0);
            const newNodeData = this.getNode(subTrail).getNodeData();
            const newAcc = [`${acc}${rowNumber}-${nodeData.selectedOption}/`, newNodeData];
            return newAcc;
        }, [startString, startNodeData]);
        return restString;
    }
    addChildrenToNode(node, children, index) {
        console.log('addChildrenToNode1');
        const indexToInsert = node.parseIndex(index);
        const nodeData = node.getNodeData();
        console.log('addChildrenToNode2');
        const optionsStart = nodeData.options.slice(0, indexToInsert);
        const optionsEnd = nodeData.options.slice(indexToInsert + 1);
        const nodeOptionData = node.getOptionContent(indexToInsert);
        const [newContext, newContent] = children.reduce((acc, child) => {
            const [newContext, id] = acc[0].insertNode(child, node.getRoute(), indexToInsert);
            console.log('addChildrenToNode3');
            const newAcc = [newContext, acc[1].concat([[node.getNodeType(), id]])];
            return newAcc;
        }, [this, []]);
        console.log('addChildrenToNode4', newContext, newContent);
        const updatedOption = {
            ...nodeOptionData,
            content: [...nodeOptionData.content, ...newContent]
        };
        const newOptions = [...optionsStart, updatedOption, ...optionsEnd];
        console.log('addChildrenToNode5', updatedOption, newOptions);
        const newNodeData = {
            selectedOption: nodeData.selectedOption,
            description: nodeData.description,
            collapsed: nodeData.collapsed,
            options: newOptions
        };
        console.log('addChildrenToNod6', newNodeData);
        const newNode = newContext.getNode(node.getRoute());
        const newerContext = newNode.setNodeData(newNodeData);
        console.log('addChildrenToNode7', newNode.context.data, newerContext);
        // this.updateData(newerContext.data)
        return this.setNodes(newerContext.data.nodes);
    }
    moveNodeToTopChild(subjectNode, targetNode, index) {
        const indexToInsert = targetNode.parseIndex(index);
        const newEdge = [subjectNode.getNodeType(), subjectNode.getNodeId()];
        const currentTargetData = targetNode.getOptionContent(indexToInsert);
        const newTargetData = {
            ...currentTargetData,
            content: [newEdge, ...currentTargetData.content]
        };
        const newContext = targetNode.setNodeOptionData(indexToInsert, newTargetData);
        const newContextSubject = newContext.getNode(subjectNode.getRoute());
        const newContextWithDeleted = newContextSubject.deleteNode();
        return this.setNodes(newContextWithDeleted.data.nodes);
    }
    moveNodeToOlderSibling(subjectNode, targetNode, index) {
        const indexToInsert = targetNode.parseIndex(index);
        const newEdge = [subjectNode.getNodeType(), subjectNode.getNodeId()];
        const [currentTargetParent, childIndex, parentSelectedIndex] = targetNode.getParent(1);
        const targetParentData = currentTargetParent.getOptionContent(parentSelectedIndex);
        const newSubjectIndex = childIndex;
        const beforeContent = targetParentData.content.slice(0, newSubjectIndex);
        const afterContent = targetParentData.content.slice(newSubjectIndex);
        const newContent = beforeContent.concat([newEdge]).concat(afterContent);
        const newContentFiltered = newContent.filter((e, ix) => {
            return ix === newSubjectIndex ? true : (e[0] !== subjectNode.getNodeType() || e[1] !== subjectNode.getNodeId());
        });
        console.log('moveNodeToOlderSibling', newContentFiltered, newSubjectIndex, newContent, beforeContent, afterContent);
        const newTargetData = {
            ...targetParentData,
            content: newContentFiltered
        };
        const newContext = currentTargetParent.setNodeOptionData(parentSelectedIndex, newTargetData);
        return this.setNodes(newContext.data.nodes);
    }
    moveNodeToYoungerSibling(subjectNode, targetNode, index) {
        const indexToInsert = targetNode.parseIndex(index);
        const newEdge = [subjectNode.getNodeType(), subjectNode.getNodeId()];
        const [currentTargetParent, childIndex, parentSelectedIndex] = targetNode.getParent(1);
        const targetParentData = currentTargetParent.getOptionContent(parentSelectedIndex);
        const newSubjectIndex = childIndex + 1;
        const beforeContent = targetParentData.content.slice(0, newSubjectIndex);
        const afterContent = targetParentData.content.slice(newSubjectIndex);
        const newContent = beforeContent.concat([newEdge]).concat(afterContent);
        const newContentFiltered = newContent.filter((e, ix) => {
            return ix === newSubjectIndex ? true : (e[0] !== subjectNode.getNodeType() || e[1] !== subjectNode.getNodeId());
        });
        const newTargetData = {
            ...targetParentData,
            content: newContentFiltered
        };
        const newContext = currentTargetParent.setNodeOptionData(parentSelectedIndex, newTargetData);
        return this.setNodes(newContext.data.nodes);
    }
}
