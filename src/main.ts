import vanityToPrime from "./lib/vanityToPrime.ts"
import generateKeyPair, { type PrivateKey, PublicKey } from "./lib/generateKeyPair.ts"
import encodeToPrime from "./lib/encodeToPrime.ts"
import toVanityKey, { type PrimeKey } from "./lib/toVanityKey.ts"
import isVanity from "./lib/isVanity.ts"

// CLI arg
if (Deno.args[0] === undefined) {
  console.error("No vanity name provided")
  Deno.exit()
}
const vanity = Deno.args[0].trim()
if (vanity === "") {
  console.error("Empty vanity name provided")
  Deno.exit()
}
if (isVanity(vanity) === false) {
  console.error(`Invalid characters in vanity name provided: ${ vanity }`)
  Deno.exit()
}

// Search string
const search = vanityToPrime(vanity)
const searchLength = search.length
console.log(`Searching for vanity name: ${ vanity } (${ search })`)

// Looping variables
let match = false
let privateKey: PrivateKey
let publicKey: PublicKey
let primeKey: PrimeKey
let i = 0

// Logging variables
let lastI = 0
let lastLog = Date.now()

// TODO: Multi-threading, Worker
while (match === false) {
  [privateKey, publicKey] = generateKeyPair()
  // TODO: Only encode first searchLength characters / bytes
  primeKey = encodeToPrime(publicKey)
  const v = primeKey.substring(0, searchLength)
  if (v === search) {
    match = true
  } else {
    i++
  }

  // Log guesses per minute
  const now = Date.now()
  if (now - lastLog >= 60000) {
    console.log(`Searches in last minute: ${ i - lastI }`)
    lastLog = now
    lastI = i
  }
}

console.log("private key:", privateKey!)
console.log("public key:", publicKey!)
console.log(primeKey!)
console.log(await toVanityKey(vanity, primeKey!))
