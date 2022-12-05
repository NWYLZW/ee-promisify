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

type PrimitiveTuples = [
  [StringConstructor, string],
  [NumberConstructor, number],
  [BooleanConstructor, boolean],
  [BigIntConstructor, bigint],
  [SymbolConstructor, symbol],
  [undefined, undefined],
  [null, null],
  [ObjectConstructor, object],
  [FunctionConstructor, Function],
  [ArrayConstructor, any[] | []],
]

type PrimitiveConstructorMap<T> =
  PrimitiveTuples[number] extends infer R
    ? R extends [infer K, infer V]
      ? K extends T
        ? V
    : never
    : never
    : never

type IsPrimitive<T> = T extends PrimitiveTuples[number][0] ? true : false

interface TypeAssert {
  /**
   * the function will check type is extend
   */
  equal<
    A,
    E,
    R extends boolean = A extends (
      IsPrimitive<E> extends true ? PrimitiveConstructorMap<E> : E
    ) ? true : false
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
