import { Narrow } from 'ee-promisify/type'
import { Equal as EQ } from './type.test'

interface TypeAssert {
  equal<
    A,
    E,
    R extends boolean = EQ<A, E>
  >(actual: Narrow<A>, expected: Narrow<E>, message?: string): R extends true
  ? {
    t: void
    true: void
    right: void
  }
  : {
    f: void
    false: void
    wrong: void
  }
}

declare global {
  namespace Chai {
    interface Assert {
      forType: TypeAssert
    }
  }
}
