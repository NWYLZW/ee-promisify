import { assert, use } from 'chai'
import promisify from 'ee-promisify'
import chaiForType from 'ee-promisify/lib/chai.forType'

use(chaiForType)

declare module 'ee-promisify' {
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
    assert.forType.strictEqual(args, []).expectIs.right
    const [ a0 ] = await ee.once.ber
    assert.forType.equal(a0, String).expectIs.right

    for await (const [a0, a1] of ee.on.bor) {
      assert.forType
        .equal([a0, a1], [Number, Boolean])
        .expectIs.right
    }
  })
  it('should infer event emitter', async () => {
    const ee = promisify({
      onfoo: undefined as () => void,
      onfuo: undefined as (a0: string) => void,
      onfuu: undefined as (a0: string, a1: number) => void
    })
    setTimeout(() => {
      ee.emit('foo')
      ee.emit('fuo', 'a0')
      ;([
        ['a0', 1],
        ['a1', 2],
        ['break', 0]
      ] as const).forEach(([a0, a1]) => ee.emit('fuu', a0, a1))
    }, 10)
    const args = await ee.once.foo
    assert.forType.strictEqual(args, []).expectIs.right
    const [ a0 ] = await ee.once.fuo
    assert.forType.equal(a0, String).expectIs.right
    assert.equal(a0, 'a0')
    for await (const [a0, a1] of ee.on.fuu) {
      assert.forType
        .equal([a0, a1], [String, Number])
        .expectIs.right
      if (a0 === 'break') {
        break
      }
    }
  })
})
