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
    const [ a0 ] = await ee.on.ber
    for await (const [a0, a1] of ee.on.bor) {
    }
  })
})
