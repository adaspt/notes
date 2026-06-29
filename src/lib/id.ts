const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"; // 36
const MAX = 256 - (256 % ALPHABET.length); // largest unbiased byte range

/**
 * Generates a random local id: a 12-character base36 (lowercase + digits)
 * string by default. Uses rejection sampling for an unbiased distribution.
 */
export function createId(length = 12): string {
  let id = "";
  while (id.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length - id.length));
    for (const b of bytes) {
      if (b < MAX) id += ALPHABET[b % ALPHABET.length];
    }
  }
  return id;
}
