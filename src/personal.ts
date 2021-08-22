import { inclusive, pick, pickMany } from '.'
import { domainsSample, emailProviderSample } from './samples/domains'
import { firstNamesSample, secondNamesSample } from './samples/names'
import { chain, map, Random, withValue } from './State'

export const firstName = pick(firstNamesSample)

export const firstNames = (count: number = 2) => pickMany(count)(firstNamesSample)

export const secondName = pick(secondNamesSample)

export const secondNames = (count: number = 2) => pickMany(count)(secondNamesSample)

export const date = ({ earliest = 0, latest = Date.now().valueOf() }: { earliest?: number; latest: number }) =>
  map((n: number) => new Date(n))(inclusive({ min: Math.abs(earliest), max: Math.abs(latest) }))

export const email = ({ name = pick(emailProviderSample) }: { name?: Random<string> }) => {
  const emailProvider = pick(emailProviderSample)
  const domain = pick(domainsSample)

  const parts = [name, emailProvider, domain].reduce(
    (accum, cur) => chain((accum_: string[]) => map((gen_: string) => accum_.concat(gen_))(cur))(accum),
    withValue([] as string[])
  )

  // gross, a monadic sequence would be better
  return map((p: string[]) => `${p[0]}@${[1]}.${p[2]}`)(parts)
}
