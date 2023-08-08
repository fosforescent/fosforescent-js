import StringClient from './string-client'
import { Store } from '../dag-implementation/store'
import { IFosInterpreter } from '../interpreter/types'


// type IFosStringProps = { client: IFosClient<string>, children?: IFosClient<string>[] }
// type StringTemplate = ViewTemplate<string>

describe('node basics', () => {

  test('can display created node', () => {

    const store = new Store()


    const client = new StringClient(store, store.voidAddress, store.voidAddress)
    const [myTask, newRootInterpreter] = client.interpreter.createTask('myTestTask1') as [IFosInterpreter, IFosInterpreter]
    client.setRoot(newRootInterpreter)

    // TODO: root not being updated

    const view = client.getView({level: 0})

    console.log('client displays',view )


    expect(view).toContain('[<alias: allOfEdge>(12ec44838f)]myTestTask1(a6100ccb48)')
  })

  

})
