import type { PrimaryChars, PrivateKey, PublicKey } from "@vanice/types"
import spawnWorker from "./spawnWorker.ts"
import isDeno from "./lib/isDeno.ts"

type Result = {
  privateKey: PrivateKey
  publicKey: PublicKey
}

export default (primaryName: PrimaryChars, numWorkers = 8, url?: URL): Promise<Result> => {
  const promises: Promise<Result>[] = []
  const terminationMethods: (() => void)[] = []

  const terminateAll = () => {
    terminationMethods.forEach(terminate => terminate())
  }

  for (let i = 0; i < numWorkers; i++) {
    const [promise, terminationMethod] = spawnWorker(i, primaryName, url)
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