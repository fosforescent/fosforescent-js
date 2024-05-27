export const getTerminalNode = (store) => {
    const terminalNode = store.create([]);
    return terminalNode;
};
export const getUnitNode = (store) => {
    const terminalNode = getTerminalNode(store);
    const unitNode = store.create([[terminalNode.getAddress(), terminalNode.getAddress()]]);
    return unitNode;
};
export const getAllOfNode = (store) => {
    const unitNode = getUnitNode(store);
    const allOfNode = store.create([[unitNode.getAddress(), unitNode.getAddress()]]);
    return allOfNode;
};
export const getIdNode = (store) => {
    const idNode = store.create((node) => node);
    return idNode;
};
export const getNothingNode = (store) => {
    const terminalNode = getTerminalNode(store);
    const nothingNode = store.create((node) => terminalNode);
    return nothingNode;
};
export const getNameNode = (store) => {
    const terminalNode = getTerminalNode(store);
    const unitNode = getUnitNode(store);
    const nameNode = store.create([[terminalNode.getAddress(), unitNode.getAddress()]]);
    return nameNode;
};
export const getNthDepNodeWithPattern = (store, n, pattern) => {
    if (n < 0)
        throw new Error('cannot get negative dep');
};
export const getRootInstructionNode = (store) => {
};
export const getNthCommentInstructionNode = (store) => {
};
export const getWorkflowInstructionNode = (store) => {
};
export const constructAliases = (store) => Object.entries({
    terminal: getTerminalNode(store).getAddress(),
    id: getIdNode(store).getAddress(),
    nothing: getNothingNode(store).getAddress(),
    unit: getUnitNode(store).getAddress(),
    allOf: getAllOfNode(store).getAddress(),
});
