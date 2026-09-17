import bcrypt from 'bcryptjs';

/**
 * Cryptographic utility for password hashing in ETC ERP
 * Implements robust bcrypt hashing with per-password 128-bit salt and work factor of 10.
 */

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function sha256(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  hash = hash.slice(0, 8);

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= (j & 0xff) << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1_major = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1_major + ch + k[i] + w[i]) | 0;
      const s0_major = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0_major + maj) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

const PLATFORM_SALT = 'ETC_ERP_SHA256_SALT_SECURE_2026_';
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Validates whether a given hash string follows the standard modular crypt format for bcrypt ($2a$, $2b$, or $2y$).
 */
export function isBcryptHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);
}

/**
 * Hashes a plaintext password using bcrypt with a cryptographically secure random 128-bit salt
 * and an adaptive work factor (cost) of 10 rounds.
 */
export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored hash.
 * Supports:
 * 1. Standard bcrypt hashes ($2a$, $2b$, $2y$) using constant-time comparison.
 * 2. Legacy SHA-256 hashes for seamless, zero-downtime migration of pre-existing accounts.
 *
 * Plaintext or reversible encodings (such as Base64) are strictly rejected.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false;
  }

  // 1. Primary: Verify with bcrypt if stored hash is in modular crypt format
  if (isBcryptHash(storedHash)) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch {
      return false;
    }
  }

  // 2. Legacy Fallback: Verify pre-existing salted SHA-256 hashes during migration
  try {
    const legacyCalculated = sha256(PLATFORM_SALT + password);
    if (legacyCalculated === storedHash) {
      return true;
    }
  } catch {
    // Ignore legacy calculation failures
  }

  return false;
}
