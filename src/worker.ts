import encodeToPrime from "./lib/encodeToPrime.ts"
import generateKeyPair, { type PrivateKey, type PublicKey } from "./lib/generateKeyPair.ts"

export type SuccessMessage = {
  success: true
  privateKey: PrivateKey
  publicKey: PublicKey
}

export type ProgressMessage = {
  success: false
  totalSearches: number
}

const worker = self as unknown as Worker

worker.onmessage = (event: MessageEvent) => {

  const { search } = event.data
  const searchLength = search.length

  let match = false
  let totalSearches = 0

  while (match === false) {
    const [privateKey, publicKey] = generateKeyPair() 
    // TODO: Only encode first searchLength characters / bytes
    const primeKey = encodeToPrime(publicKey)
    const value = primeKey.substring(0, searchLength)
    if (value === search) {
      worker.postMessage({
        success: true,
        privateKey,
        publicKey
      })
      match = true
    } else {
      totalSearches++
      worker.postMessage({
        success: false,
        totalSearches
      })
    }
  }
  self.close()
}