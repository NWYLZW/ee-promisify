export type U2I<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type Awaitable<T> = T | PromiseLike<T>

export type Str<T> = T extends infer R extends string ? R : never

export type Cast<A, B> = A extends B ? A : B

export type Primitive = string | number | boolean | bigint | symbol | undefined | null

export type Narrow<T> = Cast<T, [] | (T extends Primitive ? T : never) | ({
  [K in keyof T]: K extends typeof Symbol.species
    ? T[K]
    : Narrow<T[K]>
})>

export type PrimitiveTuples = [
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

export type PrimitiveConstructorMap<T> =
  PrimitiveTuples[number] extends infer R
    ? R extends [infer K, infer V]
      ? K extends T
        ? V
        : never
      : never
    : never

export type IsPrimitive<T> = T extends PrimitiveTuples[number][0] ? true : false

export type ResolveConstructors<T> =
  T extends [infer K, ...infer Rest]
    ? [ResolveConstructor<K>, ...ResolveConstructors<Rest>]
    : T

export type ResolveConstructorDict<T> = {
  [K in keyof T]: ResolveConstructor<T[K]>
}

export type ResolveConstructor<T> =
  IsPrimitive<T> extends true
    ? PrimitiveConstructorMap<T>
    : T extends any[]
      ? ResolveConstructors<T>
      : T extends Record<string | symbol, any>
        ? ResolveConstructorDict<T>
        : T

export type ExtendCheck<A, B> = A extends ResolveConstructor<B> ? true : false
