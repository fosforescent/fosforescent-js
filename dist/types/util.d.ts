export declare function isSuperset<T>(ss: T[], tt: T[]): boolean;
export declare function assert(condition: boolean, message: string): void;
export declare function counter<K>(items: K[]): Map<K, number>;
export declare const aggMap: (edges: [string, string][]) => Map<string, string[]>;
