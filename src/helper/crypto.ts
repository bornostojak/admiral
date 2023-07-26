import { generateKeyPair, generateKeyPairSync } from "crypto";

export function GeneratePrivateKey() {
    let keyPair = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: 'top secret'
        }
      })
    return keyPair.privateKey
}