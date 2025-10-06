import type { PrimaryChars, PrivateKey, PublicKey } from "@vanice/types"
import type { SuccessMessage, ProgressMessage } from "./worker.ts"
import isDeno from "./lib/isDeno.ts"

type Result = {
  privateKey: PrivateKey
  publicKey: PublicKey
}

type WorkerMessage = SuccessMessage | ProgressMessage

const displayNum = (num: number) => num + 1

const defaultUrl = new URL(isDeno ? "./worker.ts" : "/worker.js", import.meta.url)

export default (num: number, search: PrimaryChars, url: URL = defaultUrl) : [Promise<Result>, () => void] => {

  let workerInstance: Worker

  const terminate = () => {
    if (workerInstance) {
      console.log(`Terminating worker ${ displayNum(num) }...`)
      workerInstance.terminate()
    }
  }

  return [new Promise((resolve) => {

    const spawnNewWorker = () => {

      const worker = new Worker(
        url.href,
        { type: "module" }
      )

      worker.onerror = (error) => {
        console.error(`Worker ${ displayNum(num) } crashed:`, error)
        terminate()
        setTimeout(() => {
          console.log(`Respawning worker ${ displayNum(num) }...`)
          workerInstance = spawnNewWorker()
        }, 1000)
      }

      // Logging variables outside to persist between respawns
      let lastTotalSearches = 0
      let lastLog = Date.now()

      const logProgress = (totalSearches: number) => {
        // Log guesses per minute
        const now = Date.now()
        if (now - lastLog >= 60000) {
          console.log(`Worker: ${ displayNum(num) }. Searches in last minute: ${ totalSearches - lastTotalSearches }`)
          lastLog = now
          lastTotalSearches = totalSearches
        }
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
          logProgress(totalSearches)
        }
      }

      worker.postMessage({ num, search })
      return worker
    }

    workerInstance = spawnNewWorker()
  }), terminate]
}