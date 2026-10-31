/**
 * Genuine Client-Side Cryptographic Vault Service
 * Uses standard Web Crypto API (SubtleCrypto) with AES-GCM 256-bit encryption
 * and PBKDF2 (100,000 iterations) key derivation.
 * 
 * Vault data is encrypted BEFORE storage and decrypted strictly in browser memory.
 * Never transmitted as plaintext to AI models or third parties.
 */

// Convert ArrayBuffer to Base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM key from passphrase and salt using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
}

/**
 * Encrypts plaintext string using AES-GCM 256-bit with PBKDF2 key derivation.
 */
export async function encryptVaultText(plaintext: string, passphrase: string): Promise<EncryptedPayload> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any
    },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer)
  };
}

/**
 * Decrypts AES-GCM 256-bit ciphertext using passphrase.
 * Throws an error if passphrase is wrong or ciphertext is corrupted.
 */
export async function decryptVaultText(
  ciphertext: string,
  ivBase64: string,
  saltBase64: string,
  passphrase: string
): Promise<string> {
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);
  const encryptedData = base64ToBuffer(ciphertext);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any
    },
    key,
    encryptedData as any
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
