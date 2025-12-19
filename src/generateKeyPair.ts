import { 
  type PrivateKey,
  type PrivateKeyDisplay,
  type KeyPairDisplay, 
  type CryptoName, 
  type XPub, 
  generateKeyPair as generateKeyPairByCryptoName,
  derivePublicKeyFromXPub,
  displayKey
} from "@vanice/types"

export type KeyPair = Omit<KeyPairDisplay, "privateKey" | "privateKeyDisplay"> & {
  privateKey?: PrivateKey
  privateKeyDisplay?: PrivateKeyDisplay
}

export const generateKeyPair = async (cryptoName: CryptoName, shouldGenerateMnemonic = false, xPub?: XPub, index?: number): Promise<KeyPair> => {
  if (xPub !== undefined && index !== undefined) {
    const publicKey = derivePublicKeyFromXPub(cryptoName, xPub, index)
    const publicKeyDisplay = displayKey(publicKey)
    return { cryptoName, publicKey, publicKeyDisplay }
  } else {
    return await generateKeyPairByCryptoName(cryptoName, shouldGenerateMnemonic ? 12 : undefined)
  }
}