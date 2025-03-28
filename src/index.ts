import vanityToPrime from "./lib/vanityToPrime.ts"
import generateKeyPair, { type PrivateKey, PublicKey } from "./lib/generateKeyPair.ts"
import encodeToPrime from "./lib/encodeToPrime.ts"
import toVanityKey, { type PrimeKey } from "./lib/toVanityKey.ts"
import isVanity from "./lib/isVanity.ts"

(async () => {
  const vanity = Deno.args[0]
  if (isVanity(vanity) === false) {
    console.error(`Invalid characters in vanity name: ${ vanity }`)
    Deno.exit()
  }
  const search = vanityToPrime(vanity)
  console.log(vanity, search)
  let match = false
  let privateKey: PrivateKey
  let publicKey: PublicKey
  let primeKey: PrimeKey
  let i = 0

  while (match === false) {
    [privateKey, publicKey] = generateKeyPair()
    primeKey = encodeToPrime(publicKey)
    const v = primeKey.substring(0, search.length)
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
