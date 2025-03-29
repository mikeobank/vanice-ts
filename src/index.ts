import vanityToPrime from "./lib/vanityToPrime.ts"
import generateKeyPair, { type PrivateKey, PublicKey } from "./lib/generateKeyPair.ts"
import encodeToPrime from "./lib/encodeToPrime.ts"
import toVanityKey, { type PrimeKey } from "./lib/toVanityKey.ts"
import isVanity from "./lib/isVanity.ts"

(async () => {

  // CLI arg
  const vanity = Deno.args[0]
  if (isVanity(vanity) === false) {
    console.error(`Invalid characters in vanity name: ${ vanity }`)
    Deno.exit()
  }

  // Search string
  const search = vanityToPrime(vanity)
  const searchLength = search.length
  console.log(vanity, search)

  // Looping variables
  let match = false
  let privateKey: PrivateKey
  let publicKey: PublicKey
  let primeKey: PrimeKey
  let i = 0

  // @TODO: Multi-threading, Worker
  while (match === false) {
    [privateKey, publicKey] = generateKeyPair()
    // @TODO: Only encode first searchLength characters
    primeKey = encodeToPrime(publicKey)
    const v = primeKey.substring(0, searchLength)
    if (v === search) {
      match = true
    } else {
      i++
    }
    if (i % 10000 === 0) {
      console.log(i)
    }
  }

  console.log("private key:", privateKey!)
  console.log("public key:", publicKey!)
  console.log(primeKey!)
  console.log(await toVanityKey(vanity, primeKey!))
})()
