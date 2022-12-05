import { Narrow, ExtendCheck } from '../src/type'
import { Equal as EQ } from '../tests/type.test'

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
