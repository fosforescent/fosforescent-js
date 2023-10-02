import { assert } from '../util';
// type NodeData = { duration?: Duration, probability?: Probability, cost?: Cost, costAllocation?: CostAllocation }
export class NodeData {
    duration;
    probability;
    cost;
    costAllocation;
    constructor(nodeDataOptions = {}) {
        this.duration = nodeDataOptions.duration || null;
        this.probability = nodeDataOptions.probability || null;
        this.cost = nodeDataOptions.cost || null;
        this.costAllocation = nodeDataOptions.costAllocation || null;
    }
}
// gantt-task-react library does not have finer time scales than Hour
// https://github.com/MaTeMaTuK/gantt-task-react#DisplayOption
// So for now we define Minutes to be Hours so that we can still use Minutes when expressing workflows
export var DurationUnit;
(function (DurationUnit) {
    DurationUnit[DurationUnit["Seconds"] = 1] = "Seconds";
    DurationUnit[DurationUnit["Minutes"] = 3600] = "Minutes";
    DurationUnit[DurationUnit["Hours"] = 3600] = "Hours";
    DurationUnit[DurationUnit["Days"] = 86400] = "Days";
})(DurationUnit || (DurationUnit = {}));
export class Duration {
    value;
    unit;
    constructor(value, unit) {
        this.value = value;
        this.unit = unit;
    }
    getMilliseconds() {
        return this.value * this.unit * 1000;
    }
    static fromMilliseconds(ms) {
        const secs = ms / 1000;
        if (secs > DurationUnit.Days) {
            return new Duration(secs / DurationUnit.Days, DurationUnit.Days);
        }
        if (secs > DurationUnit.Hours) {
            return new Duration(secs / DurationUnit.Hours, DurationUnit.Hours);
        }
        if (secs > DurationUnit.Minutes) {
            return new Duration(secs / DurationUnit.Minutes, DurationUnit.Minutes);
        }
        return new Duration(secs, DurationUnit.Seconds);
    }
}
export class Probability {
    value;
    constructor(value) {
        this.value = value;
    }
}
export class Cost {
    marginalCost;
    constructor(marginalCost) {
        this.marginalCost = marginalCost;
    }
    // getTotalRange(node: INode): [number, number] {
    //   const marginalCost = this.marginalCost || 0
    //   if (node.nodeType === 'Task') {
    //     const summed =  node.requires.reduce((acc, cur) => {
    //       const [min, max] = cur.data.cost.getTotalRange(cur)
    //       return [acc[0] + min, acc[1] + max]
    //     }, [marginalCost, marginalCost])
    //     return summed as [number, number]
    //   } else if (node.nodeType === 'OneOfNode') {
    //     const minMax: [number, number] =  node.requires.reduce((acc, cur) => {
    //       const [min, max] = cur.data.cost.getTotalRange(cur)
    //       return [Math.min(acc[0], min), Math.max(acc[1], max)]
    //     }, [Number.MAX_SAFE_INTEGER, 0])
    //     return minMax.map((x) => x + marginalCost) as [number, number]
    //   } else {
    //     throw new Error('Cost / getTotalRange not implemented for this node type')
    //   }
    // }
    getMarginalCost() {
        return this.marginalCost;
    }
    setMarginalCost(marginalCost) {
        this.marginalCost = marginalCost;
    }
}
export class CostAllocation {
    totalAllocation;
    children = [];
    parent = null;
    constructor(totalAllocation) {
        this.totalAllocation = totalAllocation;
    }
    createChild() {
        const child = new CostAllocation(0);
        this.children.push(child);
        return child;
    }
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }
    getBalance() {
        return this.totalAllocation - this.children.reduce((acc, cur) => acc + cur.getBalance(), 0);
    }
    // setAllocation(allocation: number) {
    //   if (this.children.length > 0){
    //     throw new Error('this allocation is within use')
    //   }
    //   if (this.parent && (allocation - this.totalAllocation) > this.parent.getBalance()) {
    //     throw new Error('this allocation is too large')
    //   }
    //   this.totalAllocation = allocation
    //   this.parent?.handleChildAllocationChange(this)
    // }
    handleChildAllocationChange(child) {
        assert(this.getBalance() <= this.totalAllocation, 'Children must sum to less than parent value');
    }
}
