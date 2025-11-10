// password-manager.js
// ICS 3201 – Secure Password Manager Project
// 

import {
  getRandomBytes,
  stringToBuffer,
  bufferToString,
  encodeBuffer,
  decodeBuffer,
} from "./lib.js";

const subtle = globalThis.crypto.subtle;

/**
 * Secure password manager (Keychain)
 * Implements AES-GCM encryption, HMAC domain privacy,
 * PBKDF2 key derivation, swap & rollback protection.
 */
class Keychain {
  constructor(kvs, salt, hmacKey, encKey) {
    this.kvs = kvs || {}; // in-memory key-value store
    this.salt = salt; // Base64 string of salt
    this.hmacKey = hmacKey;
    this.encKey = encKey;
  }

  // 1. Initialize a NEW empty keychain

  static async init(password) {
    const salt = encodeBuffer(getRandomBytes(16)); // 128-bit salt
    const { hmacKey, encKey } = await Keychain._deriveKeys(password, salt);
    return new Keychain({}, salt, hmacKey, encKey);
  }

  // 2. Load from serialized representation
    static async load(password, representation, trustedDataCheck) {
    const parsed = JSON.parse(representation);
    const { kvs, salt } = parsed;
    const { hmacKey, encKey } = await Keychain._deriveKeys(password, salt);

    // rollback attack defense
    if (trustedDataCheck !== undefined) {
      const hashBuf = await subtle.digest(
        "SHA-256",
        stringToBuffer(JSON.stringify(kvs))
      );
      const computed = bufferToString(hashBuf);
      if (computed !== trustedDataCheck) {
        throw "Integrity check failed (possible rollback attack)";
      }
    }

    const keychain = new Keychain(kvs, salt, hmacKey, encKey);

// verify password correctness
const keys = Object.keys(kvs);
if (keys.length > 0) {
  const sample = kvs[keys[0]];
  try {
    await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: decodeBuffer(sample.iv),
        additionalData: stringToBuffer(keys[0]),
      },
      encKey,
      decodeBuffer(sample.ciphertext)
    );
  } catch {
    //  wrong password: throw instead of return false
    throw "Invalid master password";
  }
}

    return keychain;
  }



  // 3. Derive subkeys (HMAC + AES) using PBKDF2

  static async _deriveKeys(password, salt) {
    const baseKey = await subtle.importKey(
      "raw",
      stringToBuffer(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    const saltBuf = decodeBuffer(salt);

    const masterKey = await subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBuf,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      256
    );

    // Derive two 128-bit subkeys via HMAC of constants
    const hk = await subtle.importKey(
      "raw",
      masterKey,
      { name: "HMAC", hash: "SHA-256" }, 
      false,
      ["sign"]
    );

    const hmacKeyBytes = await subtle.sign("HMAC", hk, stringToBuffer("HMACKEY"));
    const encKeyBytes = await subtle.sign("HMAC", hk, stringToBuffer("ENCKEY"));

    const hmacKey = await subtle.importKey(
      "raw",
      hmacKeyBytes,
      { name: "HMAC", hash: "SHA-256" }, 
      false,
      ["sign", "verify"]
    );

    const encKey = await subtle.importKey(
      "raw",
      encKeyBytes,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );

    return { hmacKey, encKey };
  }


  
  // 4. Add or update a domain-password pair
  async set(domain, password) {
    const domainMac = await this._domainHMAC(domain);
    const iv = getRandomBytes(12);
    const ivLabel = getRandomBytes(12);

    // pad password to 64 bytes to hide length
    const paddedPwd = password.padEnd(64, " ");
    const cipherBuf = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: stringToBuffer(domainMac),
      },
      this.encKey,
      stringToBuffer(paddedPwd)
    );

    // Encrypt a label (the plaintext domain) so UI can list human-readable domains
    const paddedDomain = domain.padEnd(64, " ");
    const labelBuf = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: ivLabel,
        additionalData: stringToBuffer(domainMac),
      },
      this.encKey,
      stringToBuffer(paddedDomain)
    );

    this.kvs[domainMac] = {
      iv: encodeBuffer(iv),
      ciphertext: encodeBuffer(cipherBuf),
      labelIv: encodeBuffer(ivLabel),
      labelCiphertext: encodeBuffer(labelBuf),
    };
  }
 

  // List entries with decrypted domain labels when possible
  async list() {
    const entries = [];
    const keys = Object.keys(this.kvs || {});
    for (const mac of keys) {
      const entry = this.kvs[mac];
      if (!entry) continue;
      let domainLabel = null;
      try {
        const labelPlain = await subtle.decrypt(
          {
            name: "AES-GCM",
            iv: decodeBuffer(entry.labelIv),
            additionalData: stringToBuffer(mac),
          },
          this.encKey,
          decodeBuffer(entry.labelCiphertext)
        );
        domainLabel = bufferToString(labelPlain).trimEnd();
      } catch {
        domainLabel = mac.slice(0, 12) + "...";
      }
      entries.push({ domain: domainLabel, mac });
    }
    return entries;
  }
 
  
  // 5. Retrieve decrypted password
  async get(domain) {
    const domainMac = await this._domainHMAC(domain);
    const entry = this.kvs[domainMac];
    if (!entry) return null;

    try {
      const plainBuf = await subtle.decrypt(
        {
          name: "AES-GCM",
          iv: decodeBuffer(entry.iv),
          additionalData: stringToBuffer(domainMac),
        },
        this.encKey,
        decodeBuffer(entry.ciphertext)
      );

      return bufferToString(plainBuf).trimEnd(); // remove padding
    } catch {
      throw "Decryption or integrity check failed (possible swap/tamper)";
    }
  }

  // 6. Remove entry
  async remove(domain) {
    const domainMac = await this._domainHMAC(domain);
    if (this.kvs[domainMac]) {
      delete this.kvs[domainMac];
      return true;
    }
    return false;
  }

  
  // 7. Serialize keychain + hash
  async dump() {
    const kvsJSON = JSON.stringify(this.kvs);
    const hashBuf = await subtle.digest("SHA-256", stringToBuffer(kvsJSON));
    const checksum = bufferToString(hashBuf);

    const repr = JSON.stringify({
      kvs: this.kvs,
      salt: this.salt,
      checksum,
    });

    return [repr, checksum];
  }

  // 8. Internal helper: compute domain HMAC
  async _domainHMAC(domain) {
    const macBuf = await subtle.sign("HMAC", this.hmacKey, stringToBuffer(domain));
    return encodeBuffer(macBuf);
  }
}

// Export class for testing
export { Keychain };
