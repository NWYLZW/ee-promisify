import { Narrow, ExtendCheck } from '../src/type'
import { Equal as EQ } from '../tests/type.test'
import * as Chai from 'chai'
import ChaiPlugin = Chai.ChaiPlugin

type TypeExpect<R extends boolean> =
  R extends true
    ? {
      true: void
      right: void
    }
    : {
      false: void
      wrong: void
    }

interface Expecter<R extends boolean> {
  expect: TypeExpect<R>
  expectIs: TypeExpect<R>
}

interface TypeAssert {
  /**
   * the function will check type is extend
   */
  equal<
    A,
    E,
    R extends boolean = ExtendCheck<A, E>
  >(actual: Narrow<A>, expected: Narrow<E>, message?: string): Expecter<R>
  /**
   * the function will check type is equal {@see EQ}
   */
  strictEqual<
    A,
    E,
    R extends boolean = EQ<A, E>
  >(actual: Narrow<A>, expected: Narrow<E>, message?: string): Expecter<R>
}

declare global {
  namespace Chai {
    interface Assert {
      forType: TypeAssert
    }
  }
}

const expecter = {
  true: undefined,
  right: undefined
}

const typeExpect: Expecter<boolean> = {
  expect: expecter,
  expectIs: expecter
}

const plugin: ChaiPlugin = (chai, utils) => {
  utils.addProperty(chai.assert, 'forType', function () {
    return {
      equal: (actual, expected, message) => typeExpect,
      strictEqual: (actual, expected, message) => typeExpect
    } as TypeAssert
  })
}

export default plugin
