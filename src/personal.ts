import { inclusive, pick, pickMany } from '.'
import { pipe } from './functions'
import { domainsSample, emailProviderSample } from './samples/domains'
import { firstNamesSample, secondNamesSample } from './samples/names'
import { map, Random, sequenceR, sequenceT } from './State'

export const firstName = pick(firstNamesSample)

export const firstNames = (count: number = 2) => pickMany(count)(firstNamesSample)

export const secondName = pick(secondNamesSample)

export const secondNames = (count: number = 2) => pickMany(count)(secondNamesSample)

export const date = ({ earliest = 0, latest = Date.now().valueOf() }: { earliest?: number; latest?: number }) =>
  map((n: number) => new Date(n))(inclusive({ min: Math.abs(earliest), max: Math.abs(latest) }))

export const emailAddress = ({ name = pick(emailProviderSample) }: { name?: Random<string> } = {}) => {
  const emailProvider = pick(emailProviderSample)
  const domain = pick(domainsSample)

  return pipe(
    sequenceT(name, emailProvider, domain),
    map(([name, email, domain]) => `${name}@${email}.${domain}`)
  )
}

export const record = sequenceR({name: firstName, birthday: date({})})

