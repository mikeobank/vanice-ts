import type { PrimaryChars, PrivateKey, PublicKey } from "@vanice/types"
import type { SuccessMessage, ProgressMessage } from "./worker.ts"
import type { WorkerStatus } from "./Status.ts"
import isDeno from "./lib/isDeno.ts"

type Result = {
  privateKey: PrivateKey
  publicKey: PublicKey
}

export type WorkerId = number
type WorkerMessage = SuccessMessage | ProgressMessage

type StatusChangeCallback = (status: WorkerStatus) => void

const displayNum = (num: number) => num + 1

const defaultUrl = new URL(isDeno ? "./worker.ts" : "/worker.js", import.meta.url)

export default (
  id: WorkerStatus["workerId"], 
  search: PrimaryChars, 
  url: URL = defaultUrl,
  onStatusChange: StatusChangeCallback
) : [WorkerStatus, Promise<Result>, () => void] => {

  const status: WorkerStatus = {
    workerId: id,
    errors: [],
    start: Date.now(),
    attempts: 0
  }

  let workerInstance: Worker

  const terminate = () => {
    if (workerInstance) {
      console.log(`Terminating worker ${ displayNum(id) }...`)
      workerInstance.terminate()
    }
  }

  return [status, new Promise((resolve) => {

    const spawnNewWorker = () => {

      const worker = new Worker(
        url.href,
        { type: "module" }
      )

      worker.onerror = (error) => {
        status.errors.push({ datetime: Date.now(), error })
        onStatusChange(status)
        terminate()
        setTimeout(() => {
          workerInstance = spawnNewWorker()
        }, 1000)
      }

      worker.onmessage = (event: MessageEvent) => {
        const { success } = event.data as WorkerMessage
        if (success) {
          const { privateKey, publicKey } = event.data as SuccessMessage
          resolve({
            privateKey,
            publicKey,
          })
        } else {
          const { totalSearches } = event.data as ProgressMessage
          status.attempts = totalSearches
          onStatusChange(status)
        }
      }

      worker.postMessage({ search })
      return worker
    }

    workerInstance = spawnNewWorker()
  }), terminate]
}