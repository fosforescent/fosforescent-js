
import { Fos, IFosInterpreter, INode } from '.'
import { RootFosInterpreter } from './interpreter'


describe('index interface functions properly', () => {

  test('workflow example 1 works', () => {
    const fos = Fos({demo: true})

    const children = fos.getChildren()

    expect(children.length).toBe(1)

  })

})