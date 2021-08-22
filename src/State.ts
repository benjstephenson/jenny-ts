export type State<U, T> = (state: U) => [U, T]
export type Random<T> = State<number, T>

export const id = <T>(x: Random<T>) => x

export const withValue =
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

