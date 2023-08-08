
import { Fos } from '.'

describe('interface functions properly', () => {

  test('getRoot works', () => {
    const fos = Fos()
    const root = fos.getRoot()
    expect(root).toBeDefined()
  })



})
