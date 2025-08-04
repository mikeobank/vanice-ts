import { base32crockford } from "jsr:@scure/base"
import { type PrimeKey } from "./toVanityKey.ts"

const crockford2Vanice = (crockford: string) : PrimeKey => {
  return crockford
    .replace(/V/g, "U")
    .replace(/W/g, "V")
    .replace(/X/g, "W")
    .replace(/Y/g, "X")
    .replace(/Z/g, "Y")
}

export const encodeToPrime = (arr: Uint8Array) : PrimeKey => {
  return crockford2Vanice(base32crockford.encode(arr))
}

export const encodeToPrimekey = (arr: Uint8Array) : PrimeKey => {
  const flag = arr[0]
  const primeKey = encodeToPrime(arr.subarray(1))
  return `${ primeKey }${ flag }`
}
