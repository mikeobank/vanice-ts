import { type PrivateKey, type PublicKey, publicKeyToPrimaryKey, generateKeyPair } from "@vanice/types"

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

worker.onmessage = async (event: MessageEvent) => {

  const { search, cryptoName } = event.data
  const searchLength = search.length

  let match = false
  let totalSearches = 0

  while (match === false) {
    const { publicKey, privateKey } = await generateKeyPair(cryptoName) 
    const primaryKey = publicKeyToPrimaryKey(cryptoName, publicKey)
    const value = primaryKey.substring(0, searchLength)
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