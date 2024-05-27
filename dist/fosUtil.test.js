import { nodeReduce } from './fosUtil'; // adjust the path as necessary
import { FosNode, } from './fosNode';
import { FosContext } from './fosContext';
// Sample data
const contextData = {
    nodes: {
        'root': {
            selectedOption: 0,
            description: 'Root node',
            collapsed: false,
            options: [
                {
                    description: 'Option 1',
                    data: {
                        duration: { marginal: 10 }
                    },
                    content: [['key1', 'value1']]
                },
                {
                    description: 'Option 2',
                    data: {
                        duration: { marginal: 20 }
                    },
                    content: [['key2', 'value2']]
                }
            ]
        },
        'child1': {
            selectedOption: 0,
            description: 'Child 1',
            collapsed: false,
            options: [
                {
                    description: 'Option 1',
                    data: {
                        duration: { marginal: 5 }
                    },
                    content: [['key1', 'value1']]
                }
            ]
        },
        'child2': {
            selectedOption: 0,
            description: 'Child 2',
            collapsed: false,
            options: [
                {
                    description: 'Option 1',
                    data: {
                        duration: { marginal: 15 }
                    },
                    content: [['key1', 'value1']]
                }
            ]
        }
    },
    trail: [['root', 'Root node']],
    focus: {
        route: [['root', 'Root node']],
        char: 0
    },
    previousHash: ''
};
// Helper function to create FosContext
const createContext = (data) => new FosContext(data, () => { });
// Sample reducer functions
const aggOr = (acc, item) => acc + (item.data?.duration?.marginal || 0);
const aggAnd = (acc, item) => acc + item.getNodeData().options.reduce((sum, opt) => sum + (opt.data?.duration?.marginal || 0), 0);
// Tests
describe('nodeReduce', () => {
    test('reduces a tree with no children correctly', () => {
        const context = createContext(contextData);
        const root = new FosNode(context, [['root', 'Root node']]);
        const result = nodeReduce(root, aggOr, aggAnd, 0);
        expect(result).toBe(30); // 10 + 20 (Options of root node)
    });
    test('reduces a tree with multiple levels correctly', () => {
        const context = createContext({
            ...contextData,
            nodes: {
                ...contextData.nodes,
                'root': {
                    ...contextData.nodes['root'],
                    selectedOption: 0,
                    description: 'Root node',
                    collapsed: false,
                    options: [
                        ...contextData.nodes['root'].options,
                        {
                            description: 'Child Option',
                            data: {
                                duration: { marginal: 30 }
                            },
                            content: [['child', 'Child Option']]
                        }
                    ]
                }
            }
        });
        const root = new FosNode(context, [['root', 'Root node']]);
        const result = nodeReduce(root, aggOr, aggAnd, 1); // initial accumulator is 1
        expect(result).toBe(61); // Calculation: 1 + 10 + 20 + 30 = 61
    });
    test('reduces a complex tree correctly', () => {
        const context = createContext({
            ...contextData,
            nodes: {
                ...contextData.nodes,
                'root': {
                    selectedOption: 0,
                    description: 'Root node',
                    collapsed: false,
                    ...contextData.nodes['root'],
                    options: [
                        ...contextData.nodes['root'].options,
                        {
                            description: 'Child Option 1',
                            data: {
                                duration: { marginal: 10 }
                            },
                            content: [['child1', 'Child Option 1']]
                        },
                        {
                            description: 'Child Option 2',
                            data: {
                                duration: { marginal: 20 }
                            },
                            content: [['child2', 'Child Option 2']]
                        }
                    ]
                }
            }
        });
        const root = new FosNode(context, [['root', 'Root node']]);
        const result = nodeReduce(root, aggOr, aggAnd, 2); // initial accumulator is 2
        expect(result).toBe(62); // Calculation: 2 + 10 + 20 + 10 + 20 = 62
    });
});
