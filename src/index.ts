import {
  U2I,
  Awaitable,
  Str,
  Narrow,
} from 'ee-promisify/type'
import { createEEP, EEPHooks, setupHooksSymbol } from 'ee-promisify/createEEP'

export { createEEP, EEPHooks } from 'ee-promisify/createEEP'

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
  _E extends string | symbol,
  _F extends (...args: any[]) => any
> = <
  E extends _E,
  F extends _F
>(event: E, ...args: Parameters<F>) => Awaitable<void> | Awaitable<ReturnType<F>>

/**
 * define input listener
 */
export type InListener<T extends EventsType> = DefineListener<EventsName<T>, EventsFunc<T, EventsName<T>>>

/**
 * define input emitter
 */
export type InEmitter<T extends EventsType> = DefineEmitter<EventsName<T>, EventsFunc<T, EventsName<T>>>

export interface SupportEE<T extends EventsType> {
  0: {
    on: InListener<T>
    off?: InListener<T>
    emit?: InEmitter<T>
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

export type OutListener<
  Name extends string | symbol,
  Func extends (...args: any[]) => any,
  Opts extends {
    'iterator-mode': boolean
  } = {
    'iterator-mode': false
  },
  Args = Parameters<Func>
> =
  & DefineListener<Name, Func>
  & Record<
    Name,
    Opts['iterator-mode'] extends false
      ? Promise<Args>
      : {
        [Symbol.iterator]: () => Iterator<Promise<Args>>
      }
  >

type OutEmitter<
  Name extends string | symbol,
  Func extends (...args: any[]) => any,
  Args extends any[] = Parameters<Func>,
  RetT = ReturnType<Func>
> =
  & DefineEmitter<Name, (...args: Args) => RetT & {
    all: Promise<RetT[]>
  }>

type EEPromisify<
  N extends EventsType,
  InnerEvents extends Events
> = U2I<
  keyof InnerEvents extends (
    infer Event extends (keyof InnerEvents & (string | symbol))
  )
  ? Event extends Event
  ? InnerEvents[Event] extends infer Func extends (...args: any[]) => any
  ? {
    on:   OutListener<Event, Func, { 'iterator-mode': true }>
    once: OutListener<Event, Func>
    emit: OutEmitter<Event, Func>
  }
  : never : never : never
>

export type EventEmitterPromisify<
  T extends EventsType | undefined,
  EE extends EventEmitter<T>
> = [T] extends [undefined]
  ? InferEvents<EE> extends (infer InnerEvents extends Events)
    ? EEPromisify<T, InnerEvents>
    : never
  : EEPromisify<T, EventsMap[T]>

export function isWhatEE<E extends 0 | 1 | 2>(ee: any, expect: E): ee is SupportEE<any>[E] {
  if (!ee || !(ee instanceof Object)) {
    return false
  }

  switch (expect) {
    case 0:
      return typeof ee.on === 'function'
        && typeof ee.emit === 'function'
        && typeof ee.off === 'function'
    case 1:
      return Object.keys(ee).every(key => {
        return key.startsWith('on')
          && key.length > 2
          && key[2] === key[2].toUpperCase()
      })
    case 2:
      return Object.keys(ee).every(key => {
        return key.startsWith('on')
          && key.length > 2
          && key[2] === key[2].toLowerCase()
      })
  }
}

export default function promisify<
  EE extends EventEmitter<N>,
  N extends EventsType | undefined = undefined
>(ee: Narrow<EE>, n?: N): EventEmitterPromisify<N, EE> {
  const hooks: EEPHooks = {};
  const eep = createEEP()
  if (isWhatEE(ee, 0)) {
  } else if (isWhatEE(ee, 1)) {
    const allEvents = Object.keys(ee).filter(key => key.startsWith('on'))
    hooks.on = event => {
      const onEventProp = `on${event[0].toUpperCase()}${event.slice(1)}`
      if (allEvents.includes(onEventProp)) {
        ee[onEventProp] = eep.emit.bind(eep, event)
      }
    }
    hooks.off = event => {
      const onEventProp = `on${event[0].toUpperCase()}${event.slice(1)}`
      if (allEvents.includes(onEventProp)) {
        ee[onEventProp] = () => {}
      }
    }
  } else if (isWhatEE(ee, 2)) {
  } else {
    throw new TypeError('unsupport EventEmitter')
  }
  eep[setupHooksSymbol] = hooks
  return eep as any
}
