import { expect } from 'chai'
import promisify from './index'
import { Equal, Expect } from './type.test'

declare module './index' {
  export interface EventsMap {
    foo: {
      bar(): void
      ber(a0: string): void
      bor(a0: number, a1?: boolean): void
    }
  }
}

describe('Event Emiiter Promisify', function () {
  it('should test once', async () => {
    const ee = promisify({
      onbar: undefined,
      onber: undefined,
      onbor: undefined
    }, 'foo')
    const args = await ee.once.bar
    type Case0 = Expect<Equal<typeof args, []>>
    const [ a0 ] = await ee.once.ber
    type Case1 = Expect<Equal<typeof a0, string>>
    for await (const [a0, a1] of ee.on.bor) {
      type Case0 = Expect<Equal<
        [typeof a0, typeof a1], [number, boolean]
      >>
    }
  })
  it('should infer event emitter', async () => {
    const ee = promisify({
      onfoo: undefined as () => void,
      onfuo: undefined as (a0: string) => void,
      onfuu: undefined as (a0: string, a1: number) => void
    })
    const args = await ee.once.foo
    type Case0 = Expect<Equal<typeof args, []>>
    const [ a01 ] = await ee.once.fuo
    type Case1 = Expect<Equal<typeof a01, string>>
    for await (const [a0, a1] of ee.on.fuu) {
      type Case0 = Expect<Equal<
        [typeof a0, typeof a1], [string, number]
      >>
    }
  })
})
