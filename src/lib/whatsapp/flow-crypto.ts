import crypto from "crypto";
import { FlowDataExchangeRequest, FlowDataExchangeResponse } from "./types";

/**
 * Meta WhatsApp Flows Data Exchange Decryption & Encryption Utility
 * Conforms to Meta's official Flow Endpoint protocol:
 * - RSA-OAEP SHA-256 for AES key transport
 * - AES-128-GCM for payload encryption & response encryption (with inverted IV)
 */

export interface DecryptedPayloadContext<T = FlowDataExchangeRequest> {
  decryptedBody: T;
  aesKey: Buffer;
  initialVector: Buffer;
  isEncrypted: boolean;
}

/**
 * Inverts the initialization vector by flipping all bits (required by Meta response protocol)
 */
function flipVector(iv: Buffer): Buffer {
  const flipped = Buffer.alloc(iv.length);
  for (let i = 0; i < iv.length; i++) {
    flipped[i] = ~iv[i] & 0xff;
  }
  return flipped;
}

/**
 * Decrypts an incoming Flow Data Exchange request from Meta.
 * Supports fallback to unencrypted JSON in test/simulation environments.
 */
export function decryptFlowRequest<T = FlowDataExchangeRequest>(
  body: any,
  privateKeyPem?: string
): DecryptedPayloadContext<T> {
  // 1. Direct unencrypted JSON fallback (for simulated tests or dev tools)
  if (body && body.action && body.screen) {
    const mockAesKey = crypto.randomBytes(16);
    const mockIv = crypto.randomBytes(12);
    return {
      decryptedBody: body as T,
      aesKey: mockAesKey,
      initialVector: mockIv,
      isEncrypted: false,
    };
  }

  const { encrypted_flow_data, encrypted_aes_key, initial_vector } = body;

  if (!encrypted_flow_data || !encrypted_aes_key || !initial_vector) {
    throw new Error("Invalid Meta Flow payload: missing required encrypted fields.");
  }

  const rsaKey =
    privateKeyPem ||
    process.env.WHATSAPP_FLOW_PRIVATE_KEY ||
    process.env.META_FLOW_PRIVATE_KEY;

  if (!rsaKey) {
    throw new Error(
      "WhatsApp Flow Private Key is not configured on the server. Please set WHATSAPP_FLOW_PRIVATE_KEY."
    );
  }

  // 2. Decode Base64 inputs
  const encryptedAesKeyBuf = Buffer.from(encrypted_aes_key, "base64");
  const encryptedDataBuf = Buffer.from(encrypted_flow_data, "base64");
  const ivBuf = Buffer.from(initial_vector, "base64");

  // 3. Decrypt AES Key with RSA Private Key (OAEP with SHA-256)
  let aesKey: Buffer;
  try {
    aesKey = crypto.privateDecrypt(
      {
        key: rsaKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedAesKeyBuf
    );
  } catch (err: any) {
    // Attempt fallback with default PKCS1 padding if OAEP fails
    try {
      aesKey = crypto.privateDecrypt(
        {
          key: rsaKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        encryptedAesKeyBuf
      );
    } catch {
      throw new Error(`RSA Decryption failed for Flow AES key: ${err.message}`);
    }
  }

  // 4. Extract Ciphertext and Auth Tag (Last 16 bytes is the GCM Auth Tag)
  const tagLength = 16;
  const ciphertext = encryptedDataBuf.subarray(0, encryptedDataBuf.length - tagLength);
  const authTag = encryptedDataBuf.subarray(encryptedDataBuf.length - tagLength);

  // 5. Decrypt with AES-GCM
  const decipher = crypto.createDecipheriv("aes-128-gcm", aesKey, ivBuf);
  decipher.setAuthTag(authTag);

  const decryptedStr = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf-8");

  const decryptedBody = JSON.parse(decryptedStr) as FlowDataExchangeRequest;

  return {
    decryptedBody: decryptedBody as any,
    aesKey,
    initialVector: ivBuf,
    isEncrypted: true,
  };
}

/**
 * Encrypts a Flow Data Exchange response back to Meta.
 * Uses the same AES key and the flipped IV, appending the 16-byte auth tag.
 */
export function encryptFlowResponse(
  responseObj: FlowDataExchangeResponse,
  aesKey: Buffer,
  initialVector: Buffer
): string {
  const flippedIv = flipVector(initialVector);
  const cipher = crypto.createCipheriv("aes-128-gcm", aesKey, flippedIv);

  const payloadString = JSON.stringify(responseObj);
  const ciphertext = Buffer.concat([
    cipher.update(payloadString, "utf-8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();
  const encryptedResult = Buffer.concat([ciphertext, authTag]);

  return encryptedResult.toString("base64");
}

/**
 * Helper to generate a new 2048-bit RSA keypair in PEM format for Flow encryption.
 * Administrators can use this from WhatsApp Settings to generate keys with 1-click!
 */
export function generateFlowKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });

  return { publicKey, privateKey };
}
