import crypto from 'node:crypto'

/**
 * Generuje kryptograficznie bezpieczny token do użycia w linkach weryfikacyjnych.
 */
export function generateSecureToken(lengthBytes: number = 32): string {
  return crypto.randomBytes(lengthBytes).toString('hex')
}

/**
 * Hashuje token (np. sha256) do przechowywania w bazie.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Porównuje token w bezpieczny sposób (stały czas) z zapisanym hashem.
 */
export function verifyToken(token: string, tokenHash: string): boolean {
  const hashed = hashToken(token)
  // Używamy timingSafeEqual dla ochrony przed atakami timingowymi
  const bufferA = Buffer.from(hashed, 'utf8')
  const bufferB = Buffer.from(tokenHash, 'utf8')

  if (bufferA.length !== bufferB.length) {
    return false
  }

  return crypto.timingSafeEqual(bufferA, bufferB)
}
