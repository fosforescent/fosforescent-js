export declare class NodeData {
    duration: Duration | null;
    probability: Probability | null;
    cost: Cost | null;
    costAllocation: CostAllocation | null;
    constructor(nodeDataOptions?: {
        duration?: Duration;
        probability?: Probability;
        cost?: Cost;
        costAllocation?: CostAllocation;
    });
}
export declare enum DurationUnit {
    Seconds = 1,
    Minutes = 3600,
    Hours = 3600,
    Days = 86400
}
export declare class Duration {
    value: number;
    unit: DurationUnit;
    constructor(value: number, unit: DurationUnit);
    getMilliseconds(): number;
    static fromMilliseconds(ms: number): Duration;
}
export declare class Probability {
    value: number;
    constructor(value: number);
}
export declare class Cost {
    marginalCost: number;
    constructor(marginalCost: number);
    getMarginalCost(): number;
    setMarginalCost(marginalCost: number): void;
}
export declare class CostAllocation {
    totalAllocation: number;
    children: CostAllocation[];
    parent: CostAllocation | null;
    constructor(totalAllocation: number);
    createChild(): CostAllocation;
    removeChild(child: CostAllocation): void;
    getBalance(): number;
    handleChildAllocationChange(child: CostAllocation): void;
}
