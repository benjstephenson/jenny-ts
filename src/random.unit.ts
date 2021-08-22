import * as fc from 'fast-check'
import { alphaNumChar, alphaNumStr, exclusive, inclusive, lowerChar, pick, pickMany, upperChar } from '.'

describe('next in range', () => {
  it('inclusive between two limits', () => {
    fc.assert(
      fc.property(fc.nat(), fc.nat(), fc.nat(), (a, b, c) => {
        const [low, high] = a < b ? [a, b] : [b, a]
        const [_, result] = inclusive(low, high)(c)

        expect(result).toBeGreaterThanOrEqual(low)
        expect(result).toBeLessThanOrEqual(high)
      })
    )
  })

  it('exclusive between two limits', () => {
    fc.assert(
      fc.property(fc.nat(), fc.nat(), fc.nat(), (a, b, c) => {
        const [low, high] = a < b ? [a, b] : [b, a]
        const [_, result] = exclusive(low, high)(c)

        expect(result).toBeGreaterThan(low)
        expect(result).toBeLessThan(high)
      })
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

  it("picks one from array", () => {
    fc.assert(
      fc.property(fc.array(fc.string(), {minLength: 1}), fc.nat(), (sample, seed) => {
        const [_, result] = pick(sample)(seed)
        expect(sample.includes(result)).toBe(true)
      })
    )
  })

  it('picks a lowercase letter', () => {
    fc.assert(fc.property(fc.nat(), (seed) => {
      const [_, char] = lowerChar(seed)
      const letter = /^[a-z]$/
      expect(char.match(letter)).toBeTruthy()
    }))
  })

  it('picks an uppercase letter', () => {
    fc.assert(fc.property(fc.nat(), (seed) => {
      const [_, char] = upperChar(seed)
      const letter = /^[A-Z]$/
      expect(char.match(letter)).toBeTruthy()
    }))
  })

  it('picks an alphanum char', () => {
    fc.assert(fc.property(fc.nat(), (seed) => {
      const [_, char] = alphaNumChar(seed)
      const letter = /^[aA-zZ]$/
      expect(char.match(letter)).toBeTruthy()
    }))
  })

  it('picks an alphanum string', () => {
    fc.assert(fc.property(fc.nat(500), fc.nat(), (size, seed) => {
      const [_, char] = alphaNumStr(size)(seed)
      const letter = /^[aA-zZ]+$/
      expect(char.length).toBe(size)
      if (size > 0)
        expect(char.match(letter)).toBeTruthy()
      else
        expect(char).toBe('')
    }))
  })
})
