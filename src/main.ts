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
  isCryptoName,
  isXPub,
  toMnemonicString
} from "@vanice/types"
import { getPositionalArg, getArgByName, hasArg } from "./lib/args.ts"
import createWorkerPool from "./createWorkerPool.ts"

const name = getPositionalArg(Deno.args)
const cryptoName = getArgByName("crypto", Deno.args, "Schnorr")
const xPub = getArgByName("xpub", Deno.args)
const shouldGenerateMnemonic = hasArg("mnemonic", Deno.args)

console.log(shouldGenerateMnemonic)

if (name === undefined) {
  console.error("No name provided")
  Deno.exit()
}
if (isName(name) === false) {
  console.error(`Invalid characters in name: ${ name }`)
  Deno.exit()
}

if (isCryptoName(cryptoName) === false) {
  console.error(`Unsupported crypto name: ${ cryptoName } (Ed25519, ECDSA, Schnorr are supported)`)
  Deno.exit()
}

if (xPub !== undefined && isXPub(xPub) === false) {
  console.error(`Invalid XPub: ${ xPub }`)
  Deno.exit()
}

// Search string
const primaryName = toPrimaryName(name)
console.log(`Searching for name: ${ name } (${ primaryName })`)

const { privateKey, publicKey, mnemonic, index } = await createWorkerPool(
  cryptoName,
  primaryName, 
  undefined, 
  undefined, 
  workerPoolStatus => { console.log(`${ workerPoolStatus.totalAttempts } guesses (${ workerPoolStatus.attemptsPerSecond }/second)`) },
  undefined,
  shouldGenerateMnemonic,
  xPub
)
const primaryKey = publicKeyToPrimaryKey(cryptoName, publicKey)
if (privateKey !== undefined) {
  console.log(`private key (${ cryptoName }):`, privateKey)
  console.log("private key hex:", displayPrivateKey(cryptoName, privateKey))
  if (mnemonic !== undefined) {
    console.log("mnemonic:", toMnemonicString(mnemonic))
  }
} else if (xPub !== undefined) {
  console.log("xpub:", xPub)
  console.log("index:", index)
}
console.log(`public key (${ cryptoName }):`, publicKey)
console.log("public key hex:", displayPublicKey(cryptoName, publicKey))
console.log("primary key:", primaryKey)
console.log("name:", await primaryKeyToFingerprintedName(primaryKey, name))
console.log("fingerprint:", displayFingerprint(await primaryKeyToFingerprint(primaryKey)))
console.log("name key:", toNameKey(name, primaryKey))
