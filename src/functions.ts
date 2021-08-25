
export function tuple<T extends ReadonlyArray<any>>(...t: T) {
  return t
}

export function pipe<A>(a: A): A
export function pipe<A, B>(a: A, ab: (a: A) => B): B
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
export function pipe(a: unknown, ab?: Function, bc?: Function): unknown {
  switch (arguments.length) {
    case 1: return a
    case 2: return ab!(a)
    case 3: return bc!(ab!(a))
  }
}

export const identity: <A>(a: A) => A = a => a
