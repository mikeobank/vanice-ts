import type { CryptoName, XPub, Name, FingerprintDisplay } from "@vanice/types"
import { isCryptoName, isFingerprintDisplay, isName, maxIndex, fromFingerprintDisplay, toPrimaryName } from "@vanice/types"
import { type Result, spawnWorker } from "./spawnWorker.ts"
import { type WorkerPoolStatus, type WorkerStatus, createWorkerPoolStatus, updateWorkerPoolStatus } from "./Status.ts"
import throttle from "./lib/throttle.ts"
import isDeno from "./lib/isDeno.ts"

type WorkerPoolStatusChangeCallback = (status: WorkerPoolStatus) => void

export default (
  cryptoName: CryptoName,
  name: Name, 
  fingerprintDisplay?: FingerprintDisplay,
  numWorkers = 8, 
  url?: URL,
  onWorkerPoolStatusChange?: WorkerPoolStatusChangeCallback,
  throttleLimit = 1000,
  shouldGenerateMnemonic = false,
  xPub?: XPub
): Promise<Result | void> => {

  if (isCryptoName(cryptoName) === false) { 
    throw new Error(`Unsupported CryptoName: ${ cryptoName } (Ed25519, ECDSA, Schnorr are supported)`)
  }

  if (isName(name) === false) {
    throw new Error(`Invalid Name: ${ name }`)
  }

  if (fingerprintDisplay !== undefined && isFingerprintDisplay(fingerprintDisplay) === false) {
    throw new Error(`Invalid Fingerprint: ${ fingerprintDisplay }`)
  }

  const primaryName = toPrimaryName(name)
  const fingerprint = fingerprintDisplay ? fromFingerprintDisplay(fingerprintDisplay) : undefined

  const promises: Promise<Result>[] = []
  const terminationMethods: (() => void)[] = []
  const workerPoolStatus = createWorkerPoolStatus()

  const terminateAll = () => {
    terminationMethods.forEach(terminate => terminate())
  }

  const throttledOnWorkerPoolStatusChange = onWorkerPoolStatusChange ? throttle(onWorkerPoolStatusChange, throttleLimit) : undefined

  const statusChangeCallback = (status: WorkerStatus) => {
    updateWorkerPoolStatus(workerPoolStatus, status)
    throttledOnWorkerPoolStatusChange?.(workerPoolStatus)
  }

  const totalAttempts = maxIndex 
  const maxAttemptsPerWorker = Math.ceil(totalAttempts / numWorkers)

  for (let i = 0; i < numWorkers; i++) {

    const offset = i * maxAttemptsPerWorker
    
    const [status, promise, terminationMethod] = spawnWorker(
      cryptoName, 
      i, 
      primaryName, 
      fingerprint,
      url, 
      statusChangeCallback, 
      shouldGenerateMnemonic,
      xPub, 
      maxAttemptsPerWorker, 
      offset
    )
    workerPoolStatus.workers.push(status)
    promises.push(promise)
    terminationMethods.push(terminationMethod)
  }

  // Clean up workers on process exit
  if (isDeno) {
    Deno.addSignalListener("SIGINT", () => {
      console.log("Terminating all workers...")
      terminateAll()
      Deno.exit()
    })
  }

  return Promise.any(promises).then(result => {
    // Terminate all other workers
    terminateAll()
    return result
  }).catch(() => {
    if (xPub !== undefined) {
      throw new Error("XPub derivation exhausted")
    } else {
      throw new Error("All workers failed")
    }
  })
}