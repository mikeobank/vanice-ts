import encodeToPrime from "./encodeToPrime.ts"
import isPrime from "./isPrime.ts"
import isVanity from "./isVanity.ts"
import toEmojis from "./toEmojis.ts"

export type Prime = string
export type PrimeKey = string
export type VanityName = string
export type VanityKey = string
export type Emojis = string

const hashPrimeKey = async (primeKey: PrimeKey) : Promise<Uint8Array> => {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(primeKey))
  return new Uint8Array(buffer)
} 

export default async (vanity: VanityName, primeKey: PrimeKey, emojiLength?: number) : Promise<VanityKey> => { 
  if (isVanity(vanity) === false) {
    throw new Error(`Not a valid vanity name: ${ vanity }`)
  }
  if (isPrime(primeKey) === false) {
    throw new Error(`Not a valid prime key: ${ primeKey }`)
  }
  const l = emojiLength ?? ((10 - vanity.length >= 3) ? 10 - vanity.length : 3)
  const prime = encodeToPrime(await hashPrimeKey(primeKey))
  const emojis = toEmojis(prime.substring(0, l))
  return `${ vanity }${ emojis }`
}