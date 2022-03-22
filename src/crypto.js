import { encode, decode } from './base64.js'

const ITERATIONS = 12345;

const IV_LENGTH = 12;
const SALT_LENGTH = 16;

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function uuid() {
  return crypto.randomUUID()
}

export async function decrypt(encrypted, password) {
    const buffer = decode(encrypted)
    const buff = new Uint8Array(buffer)
  
    let bytes = 0
    const salt = new Uint8Array(buff.slice(bytes, (bytes += SALT_LENGTH)))
    const iv = new Uint8Array(buff.slice(bytes, (bytes += IV_LENGTH)))
    const data = new Uint8Array(buff.slice(bytes))

    const aesKey = await deriveKey(password, salt, ['decrypt'])
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      data,
    )
    return decoder.decode(decrypted)
}

export async function encrypt(plain, password) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    const aesKey = await deriveKey(password, salt, ['encrypt'])
    const content = encoder.encode(plain)

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      content
    )

    const encryptedBytes = new Uint8Array(encrypted)
    
    let buff = new Uint8Array(
        salt.byteLength +
        iv.byteLength +
        encryptedBytes.byteLength
    )
    let bytes = 0
    buff.set(salt, bytes)
    buff.set(iv, (bytes += salt.byteLength))
    buff.set(encryptedBytes, (bytes += iv.byteLength))
    return encode(buff.buffer)
}
 
async function deriveKey(password, salt, keyUsages) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    key,
    { 
      name: 'AES-GCM', 
      length: 256 
    },
    false,
    keyUsages
  )
}
