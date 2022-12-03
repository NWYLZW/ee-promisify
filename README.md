# ee-promisify

```ts
import promisify from 'ee-promisify'

declare module 'ee-promisify' {
  export interface Events {
    ws: {
      open(): void
      message(data: string): void
      close(): void
    }
  }
}

const ee = promisify(new EventEmitter(), 'ws')

await ee.open

for await (const [data] of ee.message) {
  console.log('data', data)
}

/**
 * emit(event, ...args)            -> Promise<T>
 * emit(event, ...args).race       -> Promise<T>
 *   这将同时触发所有的监听器，但只返回第一个完成的 Promise
 * emit(event, ...args).all        -> Promise<T[]>
 *   这将同时触发所有的监听器，但只有全部完成才返回所有完成的 Promise，如果有一个失败，就会抛出错误
 * emit(event, ...args).allSettled -> Promise<PromiseResult<T>>
 *   这将同时触发所有的监听器，不管成功或失败都会返回所有的 Promise 执行结果
 * emit(event, ...args).serial     -> Promise<T>
 *   这将顺序触发所有的监听器，但只返回最后一个完成的 Promise
 *
 * await ee[event]
 * for await (const [arg0, arg1] of ee[event]) {}
 */
```
