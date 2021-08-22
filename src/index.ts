interface Some<T> {
  _type: 'Some'
  value: T
}

interface None {
  _type: 'None'
}

type Option<T> = Some<T> | None

type State<U, T> = (state: U) => [U, T]
export type Random<T> = State<number, T>

const multiplier = 1839567234
const modulus = 8239451023
const increment = 972348567

/**
 * An implementation of a [Linear Congruential (pseudo-random) Generator](https://en.wikipedia.org/wiki/Linear_congruential_generator).
 */
export const getNextSeed: Random<number> = (seed) => {
  const nextSeed = (multiplier * seed + increment) % modulus
  return [nextSeed, nextSeed]
}

const narrowToRange = (min: number, max: number) => (num: number) => min + Math.floor((num / modulus) * (max - min))

const map: <A, B>(f: (a: A) => B) => (fa: Random<A>) => Random<B> = (f) => (generate) => (seed) => {
  const [nextSeed, a] = generate(seed)
  return [nextSeed, f(a)]
}

export const inclusive = (min: number, max: number) => map(narrowToRange(min, max))(getNextSeed)

export const exclusive = (min: number, max: number): Random<number> => inclusive(min + 1, max - 1)

export const fromSample = <T>(sample: T[], size: number) => {
  const select =
    (sample: T[], current: T[], seed: number): [number, T[]] => {
      if (current.length === size) return [seed, current]

      const [nextSeed, idx] = inclusive(0, sample.length)(seed)
      return select(sample, [...current, sample[idx]], nextSeed)
    }

  return (seed: number) => select(sample, [], seed)
}
