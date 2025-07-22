import { type Prime } from "./lib/toVanityKey.ts"

import { type PrivateKey, type PublicKey } from "./lib/generateKeyPair.ts"

type Result = {
  privateKey: PrivateKey
  publicKey: PublicKey
}

type SuccessMessage = {
  success: true
  privateKey: PrivateKey
  publicKey: PublicKey
}

type ProgressMessage = {
  success: false
  totalSearches: number
}

type WorkerMessage = SuccessMessage | ProgressMessage

export default (num: number, search: Prime) : Promise<Result> => {

  const displayNum = (num: number) => num + 1

  return new Promise(resolve => {

    const spawnNewWorker = () => {

      const worker = new Worker(
        new URL("./worker.ts", import.meta.url).href,
        { type: "module" }
      )

      worker.onerror = (error) => {
        console.error(`Worker ${ num } crashed:`, error)
        worker.terminate()
        setTimeout(() => {
          console.log(`Respawning worker ${ num }...`)
          spawnNewWorker()
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
            publicKey
          })
          worker.terminate()
        } else {
          const { totalSearches } = event.data as ProgressMessage
          logProgress(totalSearches)
        }
      }

      worker.postMessage({ num, search })
      return worker
    }

    spawnNewWorker()
  })
}