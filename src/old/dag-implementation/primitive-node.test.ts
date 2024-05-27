
import { Store } from './store'
import { FosNode } from './node'
import { RootFosInterpreter } from '../interpreter'
import { getTerminalNode } from '../dag-implementation/node-factory'
import { getEffectInstruction, getStringInstruction } from './primitive-node'
import { INode } from '..'

describe('extension basics', () => {

  test('can create primitive node and add to root', () => {
    const store = new Store()
    const rootNode = new FosNode([], store)
    const terminalNode = getTerminalNode(store)
    const rootInterpreter = new RootFosInterpreter(store, terminalNode, rootNode)

    const stringEdge = getStringInstruction(store)

    const [stringInterpreter, ..._rest] = rootInterpreter.spawn(stringEdge, stringEdge.generateTarget())
    
    const [newStringInterpreter, newRootInterpreter] = stringInterpreter.parseInput("Hello")

    console.log('newStringInterpreter', newStringInterpreter)
    console.log('newRootInterpreter', newRootInterpreter)

    const child = newRootInterpreter!.getChildren()[0] 
    expect(child!.getValue()).toBe("Hello")

  })
  
  // test('can build instruction node via builder & add to root', () => {
  //   const store = new Store()
  //   const rootNode = new FosNode([], store)
  //   const terminalNode = getTerminalNode(store)

  //   // rootInterpreter.parseInput ... ?
  //   const rootInterpreter = new RootFosInterpreter(store, terminalNode, rootNode)

  //   /**
  //    * Should add string, io, comment, and task stuff
  //    * 
  //    * each instruction & constructor should exist as target of node with void instruction (they are data)
  //    * 
  //   */

  //   // const newRoot = addCore(store, rootInterpreter)
  //   // build core here and then move
  //   const stringInterpreter = rootInterpreter.spawnFromAlias('string') // factory.addStringInstruction
  //   const ioInterpreter = rootInterpreter.spawnFromAlias('io') // factory.addEffectInstruction .... should add new effect instruction into root with void instruction & query to retrieve it ... then should remove self
  //   const notifyStringEdge = ioInterpreter.spawnFromAlias('output',(node: INode) => { console.log('node', node); return store.create([])  }) // factory.addOutputInstruction
  //   const promptNode = stringInterpreter.parseInput("Hello")
  //   const promptStringEdge = ioInterpreter.getAction('input', promptNode) 

  //   // now add instruction / target pair

  //   const instruction = null // TODO: query data for "print" effect instruction  (factory.getEffect...)
  //   const target = null // TODO: input target string (input from user + current root) => 

  //   const stack0 = rootInterpreter.spawn(instruction, target)

  //   const stack1 = stack0[stack0.length - 1]!.run()
  //   const stack2 = stack1[stack1.length - 1]!.run()


  // });

})