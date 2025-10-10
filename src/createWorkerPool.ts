import type { PrimaryChars, PrivateKey, PublicKey } from "@vanice/types"
import spawnWorker from "./spawnWorker.ts"
import isDeno from "./lib/isDeno.ts"
import { createWorkerPoolStatus, updateWorkerPoolStatus, type WorkerPoolStatus, type WorkerStatus } from "./Status.ts"
import throttle from "./lib/throttle.ts"

type Result = {
  privateKey: PrivateKey
  publicKey: PublicKey
}

type WorkerPoolStatusChangeCallback = (status: WorkerPoolStatus) => void

export default (
  primaryName: PrimaryChars, 
  numWorkers = 8, 
  url?: URL,
  onWorkerPoolStatusChange?: WorkerPoolStatusChangeCallback,
  throttleLimit = 1000
): Promise<Result> => {

  const promises: Promise<Result>[] = []
  const terminationMethods: (() => void)[] = []
  const workerPoolStatus = createWorkerPoolStatus()

  const terminateAll = () => {
    terminationMethods.forEach(terminate => terminate())
  }

  const throttledOnWorkerPoolStatusChange = onWorkerPoolStatusChange ? throttle(onWorkerPoolStatusChange, throttleLimit) : undefined

  for (let i = 0; i < numWorkers; i++) {
    const statusChangeCallback = (status: WorkerStatus) => {
      updateWorkerPoolStatus(workerPoolStatus, status)
      throttledOnWorkerPoolStatusChange?.(workerPoolStatus)
    }
    
    const [status, promise, terminationMethod] = spawnWorker(i, primaryName, url, statusChangeCallback)
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

  return Promise.race(promises).then(result => {
    // Terminate all other workers
    terminateAll()
    return result
  })
}