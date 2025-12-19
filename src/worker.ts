import { type XPub, publicKeyToPrimaryKey } from "@vanice/types"
import { type KeyPair, generateKeyPair } from "./generateKeyPair.ts"

export type SuccessMessage = KeyPair & {
  success: true
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
    const keyPair = await generateKeyPair(cryptoName, shouldGenerateMnemonic, xPub, index) 
    const { publicKey } = keyPair
    const primaryKey = publicKeyToPrimaryKey(cryptoName, publicKey)
    const value = primaryKey.substring(0, searchLength)
    if (value === search) {
      worker.postMessage({
        success: true,
        ...keyPair,
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