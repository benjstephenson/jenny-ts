import {pipe} from './functions'
import {chain, id, map, Random, withValue} from './State'

const multiplier = 1839567234
const modulus = 8239451023
const increment = 972348567

/**
 * https://en.wikipedia.org/wiki/Linear_congruential_generator
 */
export const getNextSeed: Random<number> = (seed) => {
  const nextSeed = (multiplier * seed + increment) % modulus
  return [nextSeed, nextSeed]
}

const narrowToRange: ({min, max}: {min: number, max: number}) => (num: number) => number = ({min, max}) => num => min + Math.floor((num / modulus) * (max - min))

export const inclusive = ({min, max}: {min: number, max: number}) => map(narrowToRange({min, max}))(getNextSeed)

export const exclusive = ({min, max}: {min: number, max: number}): Random<number> => inclusive({min: min + 1, max: max - 1})

export const bool = map((n: number) => n < 1)(inclusive({min: 0, max: 1}))

export const pick =
  <T>(sample: T[]): Random<T> =>
  (seed: number) => {
    const [nextSeed, index] = map(narrowToRange({min: 0, max: sample.length - 1}))(getNextSeed)(seed)
    return [nextSeed, sample[index]]
  }

export const lowerChar2 = pipe(
  inclusive({min: 97, max: 122}),
  map(String.fromCharCode)
)

export const lowerChar = map(String.fromCharCode)(inclusive({min: 97, max: 122}))

export const upperChar = map(String.fromCharCode)(inclusive({min: 65, max: 90}))

export const alphaNumChar: Random<string> = chain(id)(
  pick([lowerChar, upperChar, map(Number.toString)(inclusive({min: 0, max: 9}))])
)

export const arrayOf =
  (size: number) =>
  <T>(gen: Random<T>): Random<T[]> => {
    let items: Random<T>[] = []
    while (items.length < size) {
      items.push(gen)
    }

    return items.reduce(
      (accum, cur) => 
        pipe(
          accum,
          chain((accum_) =>
            pipe(
              cur,
              map((gen) => [...accum_, gen])
            )
          )
        ),
      withValue<T[]>([])
    )
  }

export const alphaNumStr = (size: number): Random<string> =>
  map((chrs: string[]) => chrs.join(''))(arrayOf(size)(alphaNumChar))

export const pickMany =
  (size: number) =>
  <T>(sample: T[]) =>
    arrayOf(size)(pick(sample))
