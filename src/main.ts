import { displayHex, isName, toPrimaryName, publicKeyToPrimaryKey, primaryKeyToFingerprintedName, primaryKeyToFingerprint, displayFingerprint } from "@vanice/types"
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
const primaryName = toPrimaryName(name)
console.log(`Searching for name: ${ name } (${ primaryName })`)

const { privateKey, publicKey } = await createWorkerPool(
  primaryName, 
  undefined, 
  undefined, 
  workerPoolStatus => { console.log(`${ workerPoolStatus.totalAttempts } guesses (${ workerPoolStatus.attemptsPerSecond }/second)`) }
)
const primaryKey = publicKeyToPrimaryKey(publicKey)
console.log("private key:", privateKey)
console.log("private key hex:", displayHex(privateKey))
console.log("public key:", publicKey)
console.log("public key hex:", displayHex(publicKey))
console.log("primary key:", primaryKey)
console.log("name:", await primaryKeyToFingerprintedName(primaryKey, name))
console.log("fingerprint:", displayFingerprint(await primaryKeyToFingerprint(primaryKey)))
