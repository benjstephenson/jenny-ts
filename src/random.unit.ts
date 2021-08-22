import * as fc from 'fast-check'
import { exclusive, fromSample, inclusive } from '.'

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

  it('builds an array', () => {
    fc.assert(
      fc.property(fc.array(fc.string()), fc.nat(100), fc.nat(), (sample, size, seed) => {
        const [_, result] = fromSample(sample, size)(seed)
        expect(result.length).toBe(size)
      })
    )
  })
})
