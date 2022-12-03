import { expect } from 'chai'
import promisify from './index'

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
    ee.on('bar', () => {})
    const [ a0 ] = await ee.once.ber
    //      ^?
    for await (const [a0, a1] of ee.on.bor) {
      //              ^?
      //                  ^2?
    }
  })
  it('should infer event emitter', async () => {
    //    v?
    const ee = promisify({
      onfoo: undefined as () => void,
      onfuo: undefined as (a0: string) => void,
      onfuu: undefined as (a0: string, a1: number) => void
    })

    // v?
    ee.on('foo', () => {})
    // v?
    ee.on('fuo', a0 => {
      //         ^?
    })
    //                          v?
    const [ a01 ] = await ee.once.fuo
    //      ^?
    for await (const [a0, a1] of ee.on.fuu) {
      //              ^?
      //                  ^2?
    }
  })
})
