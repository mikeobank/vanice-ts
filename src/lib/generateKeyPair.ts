import * as secp from "jsr:@noble/secp256k1@2.3.0"

export type PublicKey = Uint8Array
export type PrivateKey = Uint8Array

export default () : [PublicKey, PrivateKey] => {
  const privKey = secp.utils.randomPrivateKey()
  const pubKey = secp.getPublicKey(privKey)
  return [pubKey, privKey]
}