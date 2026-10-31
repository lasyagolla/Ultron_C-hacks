/**
 * Genuine End-to-End Cryptographic Service for Blurt Private Journal
 * Uses standard Web Crypto API (SubtleCrypto):
 * - AES-GCM 256-bit authenticated encryption
 * - PBKDF2 with 200,000 iterations and SHA-256
 * - Secure canary verification (zero plaintext PIN storage)
 * - Cryptographically random 24-character recovery key
 * 
 * Journal content (title, text, pastel color) is encrypted strictly on the client
 * BEFORE storage or network transmission. The backend/cloud stores ONLY ciphertext.
 * Zero AI or external systems ever have access to the plaintext or decryption keys.
 */

import { JournalEntry, EncryptedJournalEntry, JournalSecurityConfig } from '../types';

const CANARY_SENTINEL = 'BLOOM_JOURNAL_CANARY_VERIFIED_OK';
const PBKDF2_ITERATIONS = 200000;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate random recovery key in format BLOOM-XXXX-XXXX-XXXX-XXXX
export function generateRecoveryKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(16));
  let str = '';
  for (let i = 0; i < 16; i++) {
    str += chars[randomBytes[i] % chars.length];
  }
  return `BLOOM-${str.slice(0, 4)}-${str.slice(4, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}`;
}

// SHA-256 hash a string (used for recovery key validation)
export async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(text.trim().toUpperCase()));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Derive AES-GCM 256-bit key from PIN + userId + salt using PBKDF2
export async function deriveJournalKey(pin: string, userId: string, saltBuffer: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  // Mix PIN and userId to ensure salt uniqueness per user
  const combinedSecret = `${userId}::${pin}::bloom_journal_salt`;
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(combinedSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as any,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Setup a new Journal PIN for the first time.
 * Returns the security config to be saved and the recovery key to show the user.
 */
export async function setupJournalPIN(
  userId: string,
  pin: string
): Promise<{ config: JournalSecurityConfig; recoveryKey: string }> {
  const salt = window.crypto.getRandomValues(new Uint8Array(32));
  const canaryIv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveJournalKey(pin, userId, salt);
  const encoder = new TextEncoder();

  // Encrypt verification canary
  const encryptedCanary = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: canaryIv as any },
    key,
    encoder.encode(CANARY_SENTINEL)
  );

  const recoveryKey = generateRecoveryKey();
  const recoveryKeyHash = await sha256Hex(recoveryKey);

  const config: JournalSecurityConfig = {
    userId,
    salt: bufferToBase64(salt.buffer),
    canaryCiphertext: bufferToBase64(encryptedCanary),
    canaryIv: bufferToBase64(canaryIv.buffer),
    recoveryKeyHash,
    failedAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { config, recoveryKey };
}

/**
 * Verifies a PIN against the stored JournalSecurityConfig.
 * If valid, returns the active CryptoKey in memory.
 * If invalid, throws an Error.
 */
export async function verifyPINAndDeriveKey(
  userId: string,
  pin: string,
  config: JournalSecurityConfig
): Promise<CryptoKey> {
  const salt = base64ToBuffer(config.salt);
  const canaryIv = base64ToBuffer(config.canaryIv);
  const encryptedCanary = base64ToBuffer(config.canaryCiphertext);

  const key = await deriveJournalKey(pin, userId, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: canaryIv as any },
      key,
      encryptedCanary as any
    );

    const decoder = new TextDecoder();
    const verifiedText = decoder.decode(decryptedBuffer);

    if (verifiedText !== CANARY_SENTINEL) {
      throw new Error('Verification canary mismatch');
    }

    return key;
  } catch {
    throw new Error('Incorrect journal PIN. Please try again.');
  }
}

/**
 * Resets the PIN using a verified Recovery Key.
 */
export async function resetPINWithRecoveryKey(
  userId: string,
  recoveryKey: string,
  newPin: string,
  existingConfig: JournalSecurityConfig
): Promise<{ updatedConfig: JournalSecurityConfig; newKey: CryptoKey }> {
  const hash = await sha256Hex(recoveryKey);
  if (!existingConfig.recoveryKeyHash || hash !== existingConfig.recoveryKeyHash) {
    throw new Error('Invalid recovery key. Please check the 24-character code.');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(32));
  const canaryIv = window.crypto.getRandomValues(new Uint8Array(12));
  const newKey = await deriveJournalKey(newPin, userId, salt);

  const encoder = new TextEncoder();
  const encryptedCanary = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: canaryIv as any },
    newKey,
    encoder.encode(CANARY_SENTINEL)
  );

  const updatedConfig: JournalSecurityConfig = {
    ...existingConfig,
    salt: bufferToBase64(salt.buffer),
    canaryCiphertext: bufferToBase64(encryptedCanary),
    canaryIv: bufferToBase64(canaryIv.buffer),
    failedAttempts: 0,
    lockedUntil: undefined,
    updatedAt: new Date().toISOString()
  };

  return { updatedConfig, newKey };
}

/**
 * Encrypt a Journal Entry (title, text, color, feeling).
 */
export async function encryptJournalEntry(
  entry: { title?: string; content: string; color: string; colorFeeling?: string },
  key: CryptoKey
): Promise<{ encryptedPayload: string; iv: string; salt: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();

  const payloadString = JSON.stringify({
    title: entry.title || '',
    content: entry.content || '',
    color: entry.color || '#FFF8EB',
    colorFeeling: entry.colorFeeling || 'Neutral / Default'
  });

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    encoder.encode(payloadString)
  );

  return {
    encryptedPayload: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer)
  };
}

/**
 * Decrypt an Encrypted Journal Entry.
 */
export async function decryptJournalEntry(
  encryptedPayload: string,
  ivBase64: string,
  key: CryptoKey
): Promise<{ title?: string; content: string; color: string; colorFeeling?: string }> {
  const iv = base64ToBuffer(ivBase64);
  const encryptedData = base64ToBuffer(encryptedPayload);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    encryptedData as any
  );

  const decoder = new TextDecoder();
  const jsonStr = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonStr);
}
