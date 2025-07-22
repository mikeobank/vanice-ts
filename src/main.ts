import vanityToPrime from "./lib/vanityToPrime.ts"
import encodeToPrime from "./lib/encodeToPrime.ts"
import toVanityKey from "./lib/toVanityKey.ts"
import isVanity from "./lib/isVanity.ts"
import createWorkerPool from "./pool.ts"

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
console.log(`Searching for vanity name: ${ vanity } (${ search })`)

const { privateKey, publicKey } = await createWorkerPool(search)
const primeKey = encodeToPrime(publicKey)
console.log("private key:", privateKey)
console.log("public key:", publicKey)
console.log(primeKey)
console.log(await toVanityKey(vanity, primeKey))
