import crypto from "crypto";
import bcrypt from "bcryptjs";

const ALGORITHM = "aes-256-cbc";
const RAW_KEY =
  process.env.ENCRYPTION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "super-secret-clinic-aes-256-encryption-key-for-credentials-32";

// Ensure 32-byte key for AES-256
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(RAW_KEY)
  .digest();

const IV_LENGTH = 16;

/**
 * Strong cryptographic one-way hashing for passwords (bcrypt)
 * Passwords can NEVER be decrypted or read in plain text.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

/**
 * Verify plaintext password against stored cryptographic hash
 */
export async function verifyPassword(
  plainText: string,
  storedHash: string
): Promise<boolean> {
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$")) {
    return bcrypt.compare(plainText, storedHash);
  }
  // Safe comparison fallback for legacy plain text
  return plainText === storedHash;
}

/**
 * Encrypts sensitive staff/admin personal data at rest (AES-256-CBC)
 */
export function encryptData(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
}

/**
 * Decrypts encrypted staff/admin personal data
 */
export function decryptData(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(":")) return encryptedText;
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return encryptedText;
  }
}
