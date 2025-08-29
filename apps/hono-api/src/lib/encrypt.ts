import crypto from "crypto";

// Encryption function for AES-256-CBC with static IV derived from the encryption key
export const encryptDataStaticIV = (data: string, encryptionKey: string) => {
  const iv = Buffer.from(encryptionKey.slice(0, 16));
  const key = Buffer.from(encryptionKey);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Decryption function for AES-256-CBC with static IV derived from the encryption key
export const decryptDataStaticIV = (
  encryptedData: string,
  encryptionKey: string
) => {
  const iv = Buffer.from(encryptionKey.slice(0, 16));
  const key = Buffer.from(encryptionKey);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Encryption function for AES-256-CBC with random IV
export const encryptDataRandomIV = (data: string, encryptionKey: string) => {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(encryptionKey);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

// Decryption function for AES-256-CBC with random IV
export const decryptDataRandomIV = (
  encryptedData: string,
  encryptionKey: string
) => {
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = Buffer.from(encryptionKey);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
