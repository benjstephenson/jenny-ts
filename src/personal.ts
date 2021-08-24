import { inclusive, pick, pickMany } from '.'
import { domainsSample, emailProviderSample } from './samples/domains'
import { firstNamesSample, secondNamesSample } from './samples/names'
import { chain, map, Random, sequence, traverse } from './State'

export const firstName = pick(firstNamesSample)

export const firstNames = (count: number = 2) => pickMany(count)(firstNamesSample)

export const secondName = pick(secondNamesSample)

export const secondNames = (count: number = 2) => pickMany(count)(secondNamesSample)

export const date = ({ earliest = 0, latest = Date.now().valueOf() }: { earliest?: number; latest: number }) =>
  map((n: number) => new Date(n))(inclusive({ min: Math.abs(earliest), max: Math.abs(latest) }))

export const email = ({ name = pick(emailProviderSample) }: { name?: Random<string> }) => {
  const emailProvider = pick(emailProviderSample)
  const domain = pick(domainsSample)

  const foo = sequence([name, emailProvider, domain])

  const a = map((domain: string): [string] => [domain])(domain)
  const b = chain((a: [string]) => map((email: string): [string, string] => [email, ...a])(emailProvider))(a)
  const c = chain((b: [string, string]) => map((name: string): [string, string, string] => [name, ...b])(name))(b)


  return map(([name, email, domain]: [string, string, string]) => `${name}@${email}.${domain}`)(c)
}

