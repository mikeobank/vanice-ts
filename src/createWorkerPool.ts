import type { PrimaryChars, CryptoName, XPub } from "@vanice/types"
import { type Result, spawnWorker } from "./spawnWorker.ts"
import { type WorkerPoolStatus, type WorkerStatus, createWorkerPoolStatus, updateWorkerPoolStatus } from "./Status.ts"
import throttle from "./lib/throttle.ts"
import isDeno from "./lib/isDeno.ts"

type WorkerPoolStatusChangeCallback = (status: WorkerPoolStatus) => void

export default (
  cryptoName: CryptoName,
  primaryName: PrimaryChars, 
  numWorkers = 8, 
  url?: URL,
  xPub?: XPub,
  onWorkerPoolStatusChange?: WorkerPoolStatusChangeCallback,
  throttleLimit = 1000,
): Promise<Result> => {

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

  const totalAttempts = 2 ** 32 - 1
  const maxAttemptsPerWorker = Math.ceil(totalAttempts / numWorkers)

  for (let i = 0; i < numWorkers; i++) {

    const offset = i * maxAttemptsPerWorker
    
    const [status, promise, terminationMethod] = spawnWorker(cryptoName, i, primaryName, url, statusChangeCallback, xPub, maxAttemptsPerWorker, offset)
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
  })
}