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

  for (let i = 0; i < numWorkers; i++) {
    const [promise, terminationMethod] = spawnWorker(i, search)
    promises.push(promise)
    terminationMethods.push(terminationMethod)
  }

  return Promise.race(promises).then(result => {
    // Terminate all other workers
    terminationMethods.forEach(terminate => terminate())
    return result
  })
}