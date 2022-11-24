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
 * emit       -> Promise<T>
 * race       -> Promise<T[]> -> Promise<T>
 * all        -> Promise<T[]>
 * allSettled -> Promise<PromiseResult<T>>
 * line       -> Prmise<T> -> Prmise<T>
 *
 * await ee[event]
 * for await (const [arg0, arg1] of ee[event]) {}
 */
```
