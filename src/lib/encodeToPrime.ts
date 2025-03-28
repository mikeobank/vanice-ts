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

export default (arr: Uint8Array) : PrimeKey => {
  return crockford2Vanice(base32crockford.encode(arr))
}

