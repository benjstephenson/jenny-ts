import * as fc from 'fast-check'
import { alphaNumChar, alphaNumStr, arrayOf, exclusive, inclusive, lowerChar, pick, pickMany, upperChar } from '.'
import { date, emailAddress, record } from './personal'
import { Random } from './State'

describe('next in range', () => {
  it('inclusive between two limits', () => {
    fc.assert(
      fc.property(
        fc.nat(), fc.nat(), fc.nat(),
        (low, high, seed) => {
          fc.pre(low <= high)
          const [_, result] = inclusive({ min: low, max: high })(seed)

          expect(result).toBeGreaterThanOrEqual(low)
          expect(result).toBeLessThanOrEqual(high)
        }
      )
    )
  })

  it('exclusive between two limits', () => {
    fc.assert(
      fc.property(
        fc.nat(), fc.nat(), fc.nat(),
        (low, high, seed) => {
          fc.pre(low < high - 1)
          const [_, result] = exclusive({ min: low, max: high })(seed)

          expect(result).toBeGreaterThan(low)
          expect(result).toBeLessThan(high)
        }
      )
    )
  })

  it('builds an array ', () => {
    fc.assert(
      fc.property(fc.array(fc.string()), fc.nat(100), fc.nat(), (sample, size, seed) => {
        const [_, result] = pickMany(size)(sample)(seed)
        expect(result.length).toBe(size)
      })
    )
  })

  it('picks one from array', () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { minLength: 1 }), fc.nat(), (sample, seed) => {
        const [_, result] = pick(sample)(seed)
        expect(sample.includes(result)).toBe(true)
      })
    )
  })

  it('picks a lowercase letter', () => {
    fc.assert(
      fc.property(fc.nat(), (seed) => {
        const [_, char] = lowerChar(seed)
        const letter = /^[a-z]$/
        expect(char.match(letter)).toBeTruthy()
      })
    )
  })

  it('picks an uppercase letter', () => {
    fc.assert(
      fc.property(fc.nat(), (seed) => {
        const [_, char] = upperChar(seed)
        const letter = /^[A-Z]$/
        expect(char.match(letter)).toBeTruthy()
      })
    )
  })

  it('picks an alphanum char', () => {
    fc.assert(
      fc.property(fc.nat(), (seed) => {
        const [_, char] = alphaNumChar(seed)
        const letter = /^[aA-zZ]$/
        expect(char.match(letter)).toBeTruthy()
      })
    )
  })

  it('picks an alphanum string', () => {
    fc.assert(
      fc.property(fc.nat(500), fc.nat(), (size, seed) => {
        const [_, char] = alphaNumStr(size)(seed)
        const letter = /^[aA-zZ]+$/
        expect(char.length).toBe(size)
        if (size > 0) expect(char.match(letter)).toBeTruthy()
        else expect(char).toBe('')
      })
    )
  })

  it('builds an array', () => {
    fc.assert(
      fc.property(fc.nat(500), fc.nat(), (size, seed) => {
        const staticGen: Random<number> = (seed: number) => [seed, 1]

        const [_, result] = arrayOf(size)(staticGen)(seed)
        expect(result.length).toBe(size)
        if (size > 0) {
          const distinct = [...new Set(result)]
          expect(distinct).toEqual([1])
        }
      })
    )
  })

  it('builds a date', () => {
    const now = Date.now().valueOf()
    fc.assert(
      fc.property(fc.nat(), (seed) => {
        const [_, result] = date({ earliest: now, latest: now + 1 })(seed)
        expect([now, now + 1]).toContain(result.valueOf())
      })
    )
  })

  it('builds an email', () => {
    const [_, email] = emailAddress()(20)
    console.log(email)
  })

  it('builds a record', () => {
    const [_, result] = record(20)
    console.log(JSON.stringify(result))
  })
})
