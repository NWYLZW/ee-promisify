import { assert, use } from 'chai'
import promisify from 'ee-promisify'
import chaiForType from 'ee-promisify/lib/chai.forType'

use(chaiForType)

declare module 'ee-promisify' {
  export interface EventsMap {
    foo: {
      bar(): void
      ber(a0: string): void
      bor(a0: string, a1?: number): void
    }
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Event Emiiter Promisify', function () {
  it('should test once', async () => {
    const ee = promisify({
      onbar: undefined,
      onber: undefined,
      onbor: undefined
    }, 'foo')
    ;(async () => {
      await delay(10)
      ee.emit('bar')
      await delay(10)
      ee.emit('ber', 'a0')
      await delay(10)
      for (const [a0, a1] of [
        ['a0', 1],
        ['a1', 2],
        ['break', 0]
      ] as const) {
        await delay(10)
        ee.emit('bor', a0, a1)
      }
    })().then(undefined)
    const args = await ee.once.bar
    assert.forType.strictEqual(args, []).expectIs.right
    const [ a0 ] = await ee.once.ber
    assert.forType.equal(a0, String).expectIs.right
    let c = 0
    for await (const [a0, a1] of ee.on.bor) {
      c += 1
      assert.forType
        .equal([a0, a1], [String, Number])
        .expectIs.right
      if (a0 === 'break') {
        break
      }
    }
    assert.equal(c, 3)
  })
  it('should infer event emitter', async () => {
    const ee = promisify({
      onfoo: undefined as () => void,
      onfuo: undefined as (a0: string) => void,
      onfuu: undefined as (a0: string, a1: number) => void
    })
    ;(async () => {
      await delay(10)
      ee.emit('foo')
      await delay(10)
      ee.emit('fuo', 'a0')
      await delay(10)
      for (const [a0, a1] of [
        ['a0', 1],
        ['a1', 2],
        ['break', 0]
      ] as const) {
        await delay(10)
        ee.emit('fuu', a0, a1)
      }
    })().then(undefined)
    const args = await ee.once.foo
    assert.forType.strictEqual(args, []).expectIs.right
    const [ a0 ] = await ee.once.fuo
    assert.forType.equal(a0, String).expectIs.right
    assert.equal(a0, 'a0')
    let c = 0
    for await (const [a0, a1] of ee.on.fuu) {
      c += 1
      assert.forType
        .equal([a0, a1], [String, Number])
        .expectIs.right
      if (a0 === 'break') {
        break
      }
    }
    assert.equal(c, 3)
  })
})
