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

export const ap: <A, B>(fab: Random<(a: A) => B>, ma: Random<A>) => Random<B> = (fab, ma) => (seed: number) => {
  const [s1, r1] = ma(seed)
  const [s2, f] = fab(s1)
  return [s2, f(r1)]
}

export const traverse: <A, B>(list: ReadonlyArray<Random<A>>) => (f: (a: A) => B) => Random<ReadonlyArray<B>> =
  <A, B>(list: ReadonlyArray<Random<A>>) =>
  (f: (a: A) => B) =>
    list.reduce(
      (acc, cur) => chain((accum_: ReadonlyArray<B>) => map((gen_: A) => [...accum_, f(gen_)])(cur))(acc),

      withValue<B[]>([])
    )

export const sequence = <A>(list: ReadonlyArray<Random<A>>): Random<ReadonlyArray<A>> => traverse<A, A>(list)(x => x)
