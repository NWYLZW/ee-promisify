type Awaitable<T> = T | PromiseLike<T>

type Str<T> = T extends infer R extends string ? R : never

export interface EventsMap {
  [key: string]: {
    [key: string]: (...args: any[]) => any
  }
}

export type EventsType = Str<keyof EventsMap>

export type EventsName<T extends EventsType> = Str<keyof EventsMap[T]>

export type EventsFunc<T extends EventsType, E extends EventsName<T>> = EventsMap[T][E]

export type Listener<T extends EventsType> = <
  E extends EventsName<T>,
  F extends EventsFunc<T, E>
>(
  event: E,
  callback: F
) => Awaitable<void> | Awaitable<ReturnType<F>>

export type Emitter<T extends EventsType> = <
  E extends EventsName<T>,
  F extends EventsFunc<T, E>
>(event: E, ...args: Parameters<F>) => Awaitable<void> | Awaitable<ReturnType<F>>

export interface SupportEE<Type extends EventsType> {
  0: {
    on: Listener<Type>
    off?: Listener<Type>
    emit?: Emitter<Type>
  }
  1: {
    [K in EventsName<Type> as `on${Capitalize<EventsName<Type>>}`]?: EventsFunc<Type, K>
  }
  2: {
    [K in EventsName<Type> as `on${EventsName<Type>}`]?: EventsFunc<Type, K>
  }
}

export type EventEmitter<T extends EventsType> = SupportEE<T>[keyof SupportEE<T>]

export function isWhatEE<
  T extends EventsType,
  E extends keyof SupportEE<T>
>(ee: EventEmitter<T>, expect: E): ee is SupportEE<T>[E] {
  return true
}

export type EventEmitterPromisify<
  N extends EventsType
> = {
  on: Listener<N> & {
    [K in EventsName<N>]: Parameters<EventsFunc<N, K>> extends infer P
      ? Promise<P> & {
        [Symbol.iterator]: () => Iterator<P>
      }
      : never
  }
  off: Listener<N>
  once: Listener<N>
  emit: Emitter<N>
}

export default function promisify<N extends EventsType>(ee: EventEmitter<N>, n?: N): EventEmitterPromisify<N> {
  return {} as any
}
