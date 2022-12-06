class Future<T> extends Promise<T> {
  constructor(
    public res?: (value: T | PromiseLike<T>) => void,
    public rej?: (reason: any) => void
  ) {
    super((resolve, reject) => {
      this.res = resolve
      this.rej = reject
    })
  }
  [Symbol.species] = Future
  restore(
    res = this.res,
    rej = this.rej
  ) {
    return new this[Symbol.species](res, rej)
  }
}

export const eventsMapSymbol = Symbol('eventsMap')

export const setupHooksSymbol = Symbol('setupHooks')

export interface EEPHooks {
  on?: (event: string | symbol) => any
  off?: (event: string | symbol) => any
}

export function createEEP(hook?: EEPHooks) {
  const eventsMap = new Map<string | symbol, Function[]>()
  const eep = {
    [eventsMapSymbol]: eventsMap,
    [setupHooksSymbol]: hook,
    on(event: string | symbol, callback: Function) {
      if (!eventsMap.has(event)) {
        eventsMap.set(event, [])
        hook?.on?.(event)
      }
      eventsMap.get(event)!.push(callback)
    },
    off(event: string | symbol, callback: Function) {
      if (!eventsMap.has(event)) {
        return
      }
      const callbacks = eventsMap.get(event)!
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
        if (!callbacks.length) {
          eventsMap.delete(event)
          hook?.off?.(event)
        }
      }
    },
    once(event: string | symbol, callback: Function) {
      const onceCallback = (...args: any[]) => {
        callback(...args)
        this.off(event, onceCallback)
      }
      this.on(event, onceCallback)
    },
    emit(event: string, ...args: any[]) {
      if (!eventsMap.has(event)) {
        return
      }
      const callbacks = eventsMap.get(event)!
      const ret = callbacks.map(callback => callback(...args))
      const all = Promise.all(ret)
      return Object.assign(all, { all })
    }
  }
  return {
    ...eep,
    once: new Proxy(eep.once, {
      get: (_, p) => {
        return new Promise((resolve, reject) => {
          try {
            eep.once(p, (...args) => resolve(args ?? []))
          } catch (e) {
            reject(e)
          }
        })
      }
    }),
    on: new Proxy(eep.on, {
      get: (_, p) => ({
        async *[Symbol.asyncIterator]() {
          let lock = true
          let future = new Future()
          eep.on(p, function callback(...args) {
            try {
              future.res?.((args ?? []).concat([
                () => {
                  eep.off(p, callback)
                  lock = false
                }
              ]))
            } catch (e) {
              future.rej?.(e)
            }
          })
          while (lock) {
            yield new Promise((resolve, reject) => {
              future = future.restore(resolve, reject)
            })
          }
        }
      })
    })
  }
}
