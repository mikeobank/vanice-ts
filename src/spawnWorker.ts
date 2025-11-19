import type { PrimaryChars, PrivateKey, PublicKey, CryptoName, Mnemonic, XPub } from "@vanice/types"
import type { SuccessMessage, ProgressMessage } from "./worker.ts"
import type { WorkerStatus } from "./Status.ts"
import isDeno from "./lib/isDeno.ts"

export type Result = {
  publicKey: PublicKey
  privateKey?: PrivateKey
  mnemonic?: Mnemonic
  xPub?: XPub
  index?: number
}

export type WorkerId = number
type WorkerMessage = SuccessMessage | ProgressMessage

type StatusChangeCallback = (status: WorkerStatus) => void

const displayNum = (num: number) => num + 1

const defaultUrl = new URL(isDeno ? "./worker.ts" : "/worker.js", import.meta.url)

export const spawnWorker = (
  cryptoName: CryptoName,
  id: WorkerStatus["workerId"], 
  search: PrimaryChars, 
  url: URL = defaultUrl,
  onStatusChange: StatusChangeCallback,
  shouldGenerateMnemonic = false,
  xPub?: XPub,
  offset?: number,
  maxAttempts?: number
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

  return [status, new Promise((resolve, reject) => {

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
          const { privateKey, publicKey, mnemonic, xPub, index } = event.data as SuccessMessage
          if (privateKey !== undefined) {
            resolve({
              privateKey,
              publicKey,
              mnemonic
            })
          } else if (xPub !== undefined && index !== undefined) {
            resolve({
              publicKey,
              xPub,
              index
            })
          }
        } else {
          if ("maxAttemptsReached" in event.data) {
            terminate()
            reject(new Error(`Worker ${ displayNum(id) } reached max attempts without finding a match.`))
          }
          const { totalAttempts } = event.data as ProgressMessage
          status.attempts = totalAttempts
          onStatusChange(status)
        }
      }

      worker.postMessage({ cryptoName, search, shouldGenerateMnemonic, xPub, offset, maxAttempts })
      return worker
    }

    workerInstance = spawnNewWorker()
  }), terminate]
}