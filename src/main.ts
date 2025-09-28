import { isName, toPrimaryChars, publicKeyToPrimaryKey, primaryKeyToFingerprintedName, primaryKeyToFingerprint } from "@vanice/types"
import createWorkerPool from "./createWorkerPool.ts"

// CLI arg
if (Deno.args[0] === undefined) {
  console.error("No vanity name provided")
  Deno.exit()
}
const name = Deno.args[0].trim()
if (name === "") {
  console.error("Empty vanity name provided")
  Deno.exit()
}
if (isName(name) === false) {
  console.error(`Invalid characters in chosen name: ${ name }`)
  Deno.exit()
}

// Search string
const primaryName = toPrimaryChars(name)
console.log(`Searching for name: ${ name } (${ primaryName })`)

const { privateKey, publicKey } = await createWorkerPool(primaryName)
const primaryKey = publicKeyToPrimaryKey(publicKey)
console.log("private key:", privateKey)
console.log("public key:", publicKey)
console.log("primary key:", primaryKey)
console.log("name:", await primaryKeyToFingerprintedName(primaryKey, name))
console.log("fingerprint:", await primaryKeyToFingerprint(primaryKey))
