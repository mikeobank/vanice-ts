import { 
  isName, 
  toPrimaryName, 
  publicKeyToPrimaryKey, 
  primaryKeyToFingerprintedName, 
  primaryKeyToFingerprint, 
  displayFingerprint, 
  toNameKey,
  isCryptoName,
  isXPub
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

try {

  const result = await createWorkerPool(
    cryptoName,
    primaryName, 
    undefined, 
    undefined, 
    workerPoolStatus => { console.log(`${ workerPoolStatus.totalAttempts } guesses (${ workerPoolStatus.attemptsPerSecond }/second)`) },
    undefined,
    shouldGenerateMnemonic,
    xPub
  )

  if (result === undefined) {
    console.log("createWorkerPool returned undefined result")
    Deno.exit()
  }

  const { privateKey, privateKeyDisplay, publicKey, publicKeyDisplay, mnemonicDisplay, index } = result
  const primaryKey = publicKeyToPrimaryKey(cryptoName, publicKey)
  if (privateKey !== undefined) {
    console.log(`private key (${ cryptoName }):`, privateKey)
    console.log("private key hex:", privateKeyDisplay)
    if (mnemonicDisplay !== undefined) {
      console.log("mnemonic:", mnemonicDisplay)
    }
  } else if (xPub !== undefined) {
    console.log("xpub:", xPub)
    if (index === undefined) {
      console.error("Index is undefined despite xPub being provided")
    } else {
      console.log("index:", index)
    }
  }
  console.log(`public key (${ cryptoName }):`, publicKey)
  console.log("public key hex:", publicKeyDisplay)
  console.log("primary key:", primaryKey)
  console.log("name:", await primaryKeyToFingerprintedName(primaryKey, name))
  console.log("fingerprint:", displayFingerprint(await primaryKeyToFingerprint(primaryKey)))
  console.log("name key:", toNameKey(name, primaryKey))
} catch (error) {
  console.error(error)
  Deno.exit()
}
