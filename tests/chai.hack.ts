import { Narrow } from 'ee-promisify/type'
import { Equal as EQ } from './type.test'

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
  equal<
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
