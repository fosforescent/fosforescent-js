import { Store } from "./dag-implementation/store";
import { RootFosInterpreter } from "./interpreter";
class FosInstance {
    store;
    currentTransaction = 0;
    transactions = [];
    extensions = [];
    constructor(options = {
        demo: true,
        // key: null
    }) {
        this.store = new Store();
        const initialRootInterpreter = this.store.getRoot();
        this.transactions.push(initialRootInterpreter);
    }
    getRoot() {
        const currentTransaction = this.transactions[this.currentTransaction];
        if (!currentTransaction) {
            throw new Error('no current root');
        }
        if (currentTransaction.committed) {
            throw new Error('current root is committed');
        }
        return currentTransaction;
    }
    getRootOptions() {
        return this.extensions;
    }
    // addPeer(options: PeerOptions){
    //   throw new Error('not implemented')
    // }
    getPaths() {
        throw new Error('not implemented');
    }
    followPath(index) {
        throw new Error('not implemented');
    }
    proposeUpdate(index, instruction, target) {
        throw new Error('not implemented');
    }
    parse(input) {
        throw new Error('not implemented');
    }
    // startTransaction(){
    //   return this.store.getNodeByAddress(this.root)
    // }
    getChildren() {
        throw new Error('not implemented');
        // return this.getRoot().getChildren()
    }
    getRootAddress() {
        return this.getRoot().getTarget();
    }
    registerRootInstruction(pattern) {
        this.store.create;
    }
    registerExtension(extension) {
        this.extensions.push(extension);
    }
    // run(){
    //   this.getRoot().run()
    // }
    mine() {
        console.log('test');
        /**
         * 1. Get current root
         * 2. Scan expressions... for each
         * 3. Search calculations for instruction/target pair
         * 4. If found, respond with calculation/confidence
         * 5. If not found, attempt to calculate
         * 6. If interpreter cannot simplify, it will reject promise, go to next expression
         * 7. If interpreter can simplify, it will return new INode
        */
        return false;
    }
    import(data) {
    }
    export() {
    }
    createTransaction() {
        const currentTransaction = this.getRoot();
        const currentInstruction = this.store.getNodeByAddress(currentTransaction.getInstruction());
        const currentTarget = this.store.getNodeByAddress(currentTransaction.getTarget());
        const newTransaction = new RootFosInterpreter(this.store, currentInstruction, currentTarget);
        this.transactions.push(newTransaction);
        return newTransaction;
    }
    commit(stack) {
        throw new Error("Method not implemented.");
    }
    getValue() {
        throw new Error("Method not implemented.");
    }
    updateValue(value) {
        throw new Error("Method not implemented.");
    }
    registerAction(action, callback) {
        throw new Error("Method not implemented.");
    }
    doAction(action) {
        throw new Error("Method not implemented.");
    }
}
export const Fos = (options) => {
    const fos = new FosInstance(options);
    return fos;
};
