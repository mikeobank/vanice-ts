import { type Prime } from "./lib/toVanityKey.ts"
import { type PrivateKey, type PublicKey } from "./lib/generateKeyPair.ts"
import spawnWorker from "./spawnWorker.ts"

type Result = {
  privateKey: PrivateKey
  publicKey: PublicKey
}


export default (search: Prime, numWorkers = 8): Promise<Result> => {
  const promises: Promise<Result>[] = []
  const terminationMethods: (() => void)[] = []

  const terminateAll = () => {
    terminationMethods.forEach(terminate => terminate())
  }

  for (let i = 0; i < numWorkers; i++) {
    const [promise, terminationMethod] = spawnWorker(i, search)
    promises.push(promise)
    terminationMethods.push(terminationMethod)
  }

  // Clean up workers on process exit
  Deno.addSignalListener("SIGINT", () => {
    console.log("Terminating all workers...")
    terminateAll()
    Deno.exit()
  })

  return Promise.race(promises).then(result => {
    // Terminate all other workers
    terminateAll()
    return result
  })
}