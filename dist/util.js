export function isSuperset(ss, tt) {
    const sSet = new Set(ss);
    for (const t of tt) {
        if (!sSet.has(t)) {
            return false;
        }
    }
    return true;
}
export function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}
export function counter(items) {
    const counts = new Map();
    items.forEach(it => counts.set(it, (counts.get(it) || 0) + 1));
    return counts;
}
export const aggMap = (edges) => {
    const result = new Map();
    edges.forEach(([edgeType, target]) => {
        if (result.has(edgeType)) {
            result.set(edgeType, [...result.get(edgeType), target]);
        }
        else {
            result.set(edgeType, [target]);
        }
    });
    return result;
};
