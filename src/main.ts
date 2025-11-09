import { 
  displayPublicKey, 
  displayPrivateKey, 
  isName, 
  toPrimaryName, 
  publicKeyToPrimaryKey, 
  primaryKeyToFingerprintedName, 
  primaryKeyToFingerprint, 
  displayFingerprint, 
  toNameKey,
  isCryptoName
} from "@vanice/types"
import createWorkerPool from "./createWorkerPool.ts"

const hasCryptoArg = Deno.args.length === 2
const name = hasCryptoArg ? Deno.args[1].trim() : Deno.args[0].trim()
const cryptoName = hasCryptoArg ? Deno.args[0].trim() : "Schnorr"

if (name === "") {
  console.error("No vanity name provided")
  Deno.exit()
}
if (isName(name) === false) {
  console.error(`Invalid characters in chosen name: ${ name }`)
  Deno.exit()
}

if (isCryptoName(cryptoName) === false) {
  console.error(`Unsupported crypto name: ${ cryptoName } (Ed25519, ECDSA, Schnorr are supported)`)
  Deno.exit()
}

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
console.log(`private key (${ cryptoName }):`, privateKey)
console.log("private key hex:", displayPrivateKey(cryptoName, privateKey))
console.log(`public key (${ cryptoName }):`, publicKey)
console.log("public key hex:", displayPublicKey(cryptoName, publicKey))
console.log("primary key:", primaryKey)
console.log("name:", await primaryKeyToFingerprintedName(primaryKey, name))
console.log("fingerprint:", displayFingerprint(await primaryKeyToFingerprint(primaryKey)))
console.log("name key:", toNameKey(name, primaryKey))
