import { 
  type PrivateKey,
  type KeyPair, 
  type CryptoName, 
  type XPub, 
  generateKeyPair as generateKeyPairByCryptoName,
  derivePublicKeyFromXPub,
} from "@vanice/types"

type Result = Omit<KeyPair, "privateKey"> & {
  privateKey?: PrivateKey
}

export const generateKeyPair = async (cryptoName: CryptoName, shouldGenerateMnemonic = false, xPub?: XPub, index?: number): Promise<Result> => {
  if (xPub !== undefined && index !== undefined) {
    const publicKey = derivePublicKeyFromXPub(cryptoName, xPub, index)
    return { cryptoName, publicKey }
  } else {
    return await generateKeyPairByCryptoName(cryptoName, shouldGenerateMnemonic ? 12 : undefined)
  }
}