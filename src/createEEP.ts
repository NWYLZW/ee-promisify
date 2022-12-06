export const eventsMapSymbol = Symbol('eventsMap')

export const setupHooksSymbol = Symbol('setupHooks')

export interface EEPHooks {
  on?: (event: string) => any
  off?: (event: string) => any
}

export function createEEP(hook?: EEPHooks) {
  const eventsMap = new Map<string, Function[]>()
  return {
    [eventsMapSymbol]: eventsMap,
    [setupHooksSymbol]: hook,
    on(event: string, callback: Function) {
      if (!eventsMap.has(event)) {
        eventsMap.set(event, [])
        hook?.on?.(event)
      }
      eventsMap.get(event)!.push(callback)
    },
    off(event: string, callback: Function) {
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
    once(event: string, callback: Function) {
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
}
