import { FosClient } from ".";
/**
 * TODO: remove this and replace with single, simplified function
 */
export default class StringClient extends FosClient {
    getView(opts = { level: 0 }) {
        // console.log('get String Client view', this.interpreter.getStubString(), this.interpreter.getChildren().map((child: IFosInterpreter) => child.getStubString()))
        return this.reduceTree(this.distributor, this.accumulator)(opts);
    }
    distributor(originalDistribution) {
        const returnVal = [{ ...originalDistribution, level: originalDistribution.level ? originalDistribution.level + 1 : 1 }, originalDistribution];
        // console.log('in distributor', originalDistribution, returnVal)
        return () => returnVal;
    }
    accumulator(distribution) {
        const viewGenerator = (props) => {
            const indent = distribution?.level ? '    '.repeat(distribution.level) : '';
            // console.log('view accumulator',distribution)
            const renderedChildren = props.children.map(([childDistribution, childInterpreter]) => (new StringClient(childInterpreter.store, childInterpreter.getTarget(), childInterpreter.getInstruction())).getView(childDistribution));
            return `${indent}${props.interpreter.getDisplayString()}\n${indent}---${indent}${renderedChildren.join(`\n${indent}`)}\n${indent}---\n`;
        };
        return viewGenerator;
    }
    reduceTree(distributor, integrator) {
        const reductionGenerator = (currentNodeDistribution) => {
            // console.log('reduceTree reductionGenerator', this.instruction.getAddress(), this.target.getAddress())
            const edges = this.interpreter.getChildren();
            const [childResults, selfDistribution] = edges.reduce(([accumulatedChildResults, accumultatedDistribution], child) => {
                const [childDistribution, remainingDistribution] = distributor(accumultatedDistribution)({ interpreter: child });
                // console.log('childDistribution', childDistribution, remainingDistribution)
                // const result = newInterpreter.reduceTree(distributor, integrator)(childDistribution)
                return [[...accumulatedChildResults, [childDistribution, child]], remainingDistribution];
            }, [[], currentNodeDistribution]);
            const integratedResult = integrator(selfDistribution)({ interpreter: this.interpreter, children: childResults });
            return integratedResult;
        };
        return reductionGenerator;
    }
}
