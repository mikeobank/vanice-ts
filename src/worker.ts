import { type Mnemonic, type PrivateKey, type PublicKey, type XPub, publicKeyToPrimaryKey } from "@vanice/types"
import { generateKeyPair } from "./generateKeyPair.ts"

export type SuccessMessage = {
  success: true
  publicKey: PublicKey
  privateKey?: PrivateKey
  mnemonic?: Mnemonic
  xPub?: XPub
  index?: number
}
export type FailureMessage = {
  success: false
  totalAttempts: number
  maxAttemptsReached: boolean
}

export type ProgressMessage = {
  success: false
  totalAttempts: number
}

const worker = self as unknown as Worker

worker.onmessage = async (event: MessageEvent) => {

  const { search, cryptoName, shouldGenerateMnemonic, xPub, offset, maxAttempts } = event.data
  const searchLength = search.length

  let match = false
  let totalAttempts = 0

  while (match === false) {
    const index = offset + totalAttempts 
    const { publicKey, privateKey, mnemonic } = await generateKeyPair(cryptoName, shouldGenerateMnemonic, xPub, offset + totalAttempts) 
    const primaryKey = publicKeyToPrimaryKey(cryptoName, publicKey)
    const value = primaryKey.substring(0, searchLength)
    if (value === search) {
      worker.postMessage({
        success: true,
        privateKey,
        publicKey,
        mnemonic,
        xPub,
        index
      })
      match = true
    } else {
      totalAttempts++
      worker.postMessage({
        success: false,
        totalAttempts
      })
    }
    if (maxAttempts !== undefined && totalAttempts >= maxAttempts) {
      worker.postMessage({
        success: false,
        totalAttempts,
        maxAttemptsReached: true
      })
      break
    }
  }
  self.close()
}