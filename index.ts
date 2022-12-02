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
  [key: string]: Events
}

export type EventsType = Str<keyof EventsMap>

export type EventsName<T extends EventsType> = Str<keyof EventsMap[T]>

export type EventsFunc<T extends EventsType, E extends EventsName<T>> = EventsMap[T][E]

export type DefineListener<
  _E extends string | symbol,
  _F extends (...args: any[]) => any
> = <
  E extends _E,
  F extends _F
>(event: E, callback: F) => Awaitable<void> | Awaitable<ReturnType<F>>

export type DefineEmitter<
  _E extends string,
  _F extends (...args: any[]) => any
> = <
  E extends _E,
  F extends _F
>(event: E, ...args: Parameters<F>) => Awaitable<void> | Awaitable<ReturnType<F>>

export type Listener<T extends EventsType> = DefineListener<EventsName<T>, EventsFunc<T, EventsName<T>>>

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

export type InferEvents0<EE extends SupportEE<any>[0]> = U2I<
  AllEventsByEE0<EE>
>

export type InferEvents1And2<EE extends SupportEE<any>[1 | 2]> = {
  [K in keyof EE as K extends `on${infer EventName}` ? Uncapitalize<EventName> : never]: EE[K]
}

export type InferEvents<EE extends EventEmitter<any>> =
  EE extends SupportEE<any>[0]
    ? InferEvents0<EE>
    : EE extends SupportEE<any>[1 | 2]
    ? InferEvents1And2<EE>
    : never

export function isWhatEE<
  T extends EventsType,
  E extends keyof SupportEE<T>
>(ee: EventEmitter<T>, expect: E): ee is SupportEE<T>[E] {
  return true
}

type EEPromisify<
  N extends EventsType,
  InnerEvents extends Events
> = U2I<
  keyof InnerEvents extends (
    infer Event extends (keyof InnerEvents & (string | symbol))
  )
  ? Event extends Event
  ? {
    on: InnerEvents[Event] extends infer Func extends (...args: any[]) => any
      ? DefineListener<Event, Func> & {
        [K in Event]: Parameters<Func> extends infer Args
          ? Promise<Args> & {
            [Symbol.iterator]: () => Iterator<Args>
          }
          : never
      }
      : never
  }
  : never
  : never
>

export type EventEmitterPromisify<
  T extends EventsType | undefined,
  EE extends EventEmitter<T>
> = [T] extends [undefined]
  ? InferEvents<EE> extends (infer InnerEvents extends Events)
    ? EEPromisify<T, InnerEvents>
    : never
  : EEPromisify<T, EventsMap[T]>

export default function promisify<
  EE extends EventEmitter<N>,
  N extends EventsType | undefined = undefined
>(ee: Narrow<EE>, n?: N): EventEmitterPromisify<N, EE> {
  return {} as any
}
