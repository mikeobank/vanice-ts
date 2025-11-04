import { 
  displayPublicKey, 
  displayPrivateKey, 
  isName, 
  toPrimaryName, 
  publicKeyToPrimaryKey, 
  primaryKeyToFingerprintedName, 
  primaryKeyToFingerprint, 
  displayFingerprint 
} from "@vanice/types"
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

// TODO: allow choosing crypto type via CLI arg
const cryptoName = "Schnorr"

// Search string
const primaryName = toPrimaryName(name)
console.log(`Searching for name: ${ name } (${ primaryName })`)

const { privateKey, publicKey } = await createWorkerPool(
  cryptoName,
  primaryName, 
  undefined, 
  undefined, 
  workerPoolStatus => { console.log(`${ workerPoolStatus.totalAttempts } guesses (${ workerPoolStatus.attemptsPerSecond }/second)`) }
)
const primaryKey = publicKeyToPrimaryKey(cryptoName, publicKey)
console.log("private key:", privateKey)
console.log("private key hex:", displayPrivateKey(cryptoName, privateKey))
console.log("public key:", publicKey)
console.log("public key hex:", displayPublicKey(cryptoName, publicKey))
console.log("primary key:", primaryKey)
console.log("name:", await primaryKeyToFingerprintedName(primaryKey, name))
console.log("fingerprint:", displayFingerprint(await primaryKeyToFingerprint(primaryKey)))
