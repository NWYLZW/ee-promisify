import {
  U2I,
  Awaitable,
  Str,
  Narrow,
} from './type'

export interface Events {
  [key: string]: (...args: any[]) => any
}

export interface EventsMap {
  [key: string]: Events & never
}

export type EventsType = Str<keyof EventsMap>

export type EventsName<T extends EventsType> = Str<keyof EventsMap[T]>

export type EventsFunc<T extends EventsType, E extends EventsName<T>> = EventsMap[T][E]

export type DefineListener<
  _E extends string,
  _F extends (...args: any[]) => any
> = <
  E extends _E,
  F extends _F
>(event: E, callback: F) => Awaitable<void> | Awaitable<ReturnType<F>>

type Listener<T extends EventsType> = EventsName<T> extends infer E extends EventsName<T>
  ? EventsFunc<T, E> extends infer F extends (...args: any[]) => any
  ? DefineListener<EventsName<T>, F>
  : never
  : never

export type DefineEmitter<
  _E extends string,
  _F extends (...args: any[]) => any
> = <
  E extends _E,
  F extends _F
>(event: E, ...args: Parameters<F>) => Awaitable<void> | Awaitable<ReturnType<F>>

export type Emitter<T extends EventsType> = DefineEmitter<EventsName<T>, EventsFunc<T, EventsName<T>>>

export interface SupportEE<T extends EventsType> {
  0: {
    on: Listener<T>
    off?: Listener<T>
    emit?: Emitter<T>
  }
  1: {
    [K in EventsName<T> as `on${Capitalize<EventsName<T>>}`]?: EventsFunc<T, K>
  }
  2: {
    [K in EventsName<T> as `on${EventsName<T>}`]?: EventsFunc<T, K>
  }
}

export type EventEmitter<T extends EventsType> = SupportEE<T>[keyof SupportEE<T>]

export type AllEventsByEE0<EE extends SupportEE<any>[0]> = EE['on'] extends infer F
? F extends (event: infer E extends string | symbol | number, ...args: any[]) => any
  ? { [K in E]: Parameters<F>[1] }
  : never
: never;

export type InferEvents0<T extends EventsType, EE extends SupportEE<T>[0]> = U2I<
  AllEventsByEE0<EE>
>

export type InferEvents1And2<T extends EventsType, EE extends SupportEE<T>[1 | 2]> = {
  [K in keyof EE as K extends `on${infer EventName}` ? Uncapitalize<EventName> : never]: EE[K]
}

export type InferEvents<
  T extends EventsType,
  EE extends EventEmitter<T>
> = EE extends SupportEE<T>[0]
  ? InferEvents0<T, EE>
  : EE extends SupportEE<T>[1 | 2]
  ? InferEvents1And2<T, EE>
  : never

//   _?
type T0 = InferEvents<string, {
  on:
    | DefineListener<'foo', (a: string) => void>
    | DefineListener<'fuo', (a: number) => void>
}>

//   _?
type T1 = InferEvents<'foo', {
  onFoo: undefined
  onFue: (a0: string) => void
  onFuu: undefined
  onFuo: undefined
  xxxxx: (a0: number) => void
}>

//   _?
type T2 = InferEvents<string, {
  onfoo: undefined
  onfue: (a0: string) => void
  onfuu: undefined
  onfuo: undefined
  xxxxx: (a0: number) => void
}>

export function isWhatEE<
  T extends EventsType,
  E extends keyof SupportEE<T>
>(ee: EventEmitter<T>, expect: E): ee is SupportEE<T>[E] {
  return true
}

type EEPromisify<N extends EventsType, EE extends EventEmitter<N>> = {
  // on: L & {
  //   [K in L extends Listener<infer Events> ? Events : never]: Parameters<Listener<K>>[1] extends (...args: infer Args) => any
  //     ? Promise<Args> & {
  //       [Symbol.iterator]: () => Iterator<Args>
  //     }
  //     : never
  // }
}

export type EventEmitterPromisify<
  T extends EventsType,
  EE extends EventEmitter<T>
> = [EventsMap[T]] extends [Events & never]
  ? 1
  : 2

type X0 = EventsMap['foo']
//   ^?
type X1 = EventsMap[string]
//   ^?

// &./index.spec.ts:16:12?
// &./index.spec.ts:30:12?

export default function promisify<
  N extends EventsType,
  EE extends EventEmitter<N>
>(ee: Narrow<EE>, n?: N): EventEmitterPromisify<N, EE> {
  return {} as any
}
