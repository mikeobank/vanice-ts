import * as secp from "jsr:@noble/secp256k1"

export type PublicKey = Uint8Array
export type PrivateKey = Uint8Array

export default () : [PublicKey, PrivateKey] => {
  const privKey = secp.utils.randomPrivateKey()
  const pubKey = secp.getPublicKey(privKey).subarray(1)
  return [pubKey, privKey]
}