import { identity, pipe, tuple } from './functions'

export type State<U, T> = (state: U) => [U, T]
export type Random<T> = State<number, T>

export const id = <T>(x: Random<T>) => x

export const of =
  <T>(value: T): Random<T> =>
  (seed: number) =>
    [seed, value]

export const get =
  <T>(state: Random<T>) =>
  (seed: number) =>
    state(seed)[1]

export const map: <A, B>(f: (a: A) => B) => (fa: Random<A>) => Random<B> = (f) => (generate) => (seed) => {
  const [nextSeed, a] = generate(seed)
  return [nextSeed, f(a)]
}

export const chain: <A, B>(f: (a: A) => Random<B>) => (ma: Random<A>) => Random<B> = (f) => (ma) => (seed) => {
  const [nextSeed, a] = ma(seed)
  return f(a)(nextSeed)
}

export const ap: <A, B>(fab: Random<(a: A) => B>, ma: Random<A>) => Random<B> = (fab, ma) => (seed: number) => {
  const [s1, r1] = ma(seed)
  const [s2, f] = fab(s1)
  return [s2, f(r1)]
}

export const lift2: <A, B, C>(fab: (a: A, b: B) => C) => (a: Random<A>) => (b: Random<B>) => Random<C> =
  (f) => (a) => (b) =>
    pipe(
      a,
      chain((a_) =>
        pipe(
          b,
          map((b_) => f(a_, b_))
        )
      )
    )

export const traverse: <A, B>(list: ReadonlyArray<Random<A>>) => (f: (a: A) => B) => Random<ReadonlyArray<B>> =
  <A, B>(list: ReadonlyArray<Random<A>>) =>
  (f: (a: A) => B) => {
    return list.reduce(
      (acc, cur) =>
        pipe(
          acc,
          pipe(
            cur,
            lift2((a, b) => [...b, f(a)])
          )
        ),
      of<B[]>([])
    )
  }

export const sequence = <A>(list: ReadonlyArray<Random<A>>): Random<ReadonlyArray<A>> => pipe(identity, traverse(list))

export function sequenceT<T extends Array<Random<any>>>(
  ...t: T & { readonly 0: Random<any> }
): Random<{ [K in keyof T]: [T[K]] extends [Random<infer A>] ? A : never }>
export function sequenceT<A>(...list: Array<Random<A>>) {
  const [head, ...tail] = list

  return pipe(
    head,
    chain((head_) => {
      const fa = pipe(head_, tuple)
      return tail.reduce(
        (acc, cur) =>
          pipe(
            acc,
            pipe(
              cur,
              lift2((a, b) => tuple(a, ...b))
            )
          ),
        of(fa as any)
      )
    })
  )
}

const recordBuilder = (k: string, v: any) => (r: Record<string, any>) => {
  return {
    ...r,
    [k]: v
  }
}

export function sequenceR<R extends Record<string, Random<any>>>(
  r: R
): Random<{ [K in keyof R]: [R[K]] extends [Random<infer A>] ? A : never }>
export function sequenceR<A>(r: Record<string, Random<A>>) {
  const [[headK, headV], ...tail] = Object.entries(r)

  return pipe(
    headV,
    chain((headV_) => {
      const fa = pipe({}, recordBuilder(headK, headV_))

      return tail.reduce((acc, [currK, currV]) => {
        const p = (r: Record<string, any>) =>
          pipe(
            currV,
            map((value) => recordBuilder(currK, value)(r))
          )

        return chain((acc_: Record<string, any>) => p(acc_))(acc)
      }, of(fa))
    })
  )
}
