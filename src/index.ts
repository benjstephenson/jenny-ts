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


const chain: <E, A, B>(f: (a: A) => State<E, B>) => (ma: State<E, A>) => State<E, B> = (f) => (ma) => (s1) => {
  const [s2, a] = ma(s1)
  return f(a)(s2)
}

const id = <T>(x: Random<T>) => x

export const inclusive = (min: number, max: number) => map(narrowToRange(min, max))(getNextSeed)

export const exclusive = (min: number, max: number): Random<number> => inclusive(min + 1, max - 1)

export const bool = map((n: number) => n < 1)(inclusive(0, 1))
export const pick = <T>(sample: T[]): Random<T> => (seed: number) => {
  const [nextSeed, index] = map(narrowToRange(0, sample.length - 1))(getNextSeed)(seed)
  return [nextSeed, sample[index]]
}

export const pickMany = <T>(sample: T[], size: number): Random<T[]> => {
  const loop = (list: T[]) => (seed: number): [number, T[]] => {
    if (list.length === size) return [seed, list]
 
    const [nextSeed, a] = pick(sample)(seed)
    return loop([...list, a])(nextSeed)
  }

  return loop([])
}

export const lowerChar = map(String.fromCharCode)(inclusive(97, 122))

export const upperChar = map(String.fromCharCode)(inclusive(65, 90))

export const alphaNumChar: Random<string> = chain(id)(pick([lowerChar, upperChar, map(Number.toString)(inclusive(0, 9))]))

export const alphaNumStr = (size: number) => {
  const loop = (list: string) => (seed: number): [number, string] => {
    if (list.length === size) return [seed, list]
 
    const [nextSeed, a] = alphaNumChar(seed)
    return loop(list.concat(a))(nextSeed)
  }

  return loop('')
}

