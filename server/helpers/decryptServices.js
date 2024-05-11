const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");
  
  function decryptSymetricService(cipher, key) {
    const keySalt = scryptSync(key, "salt", 24);
  // split by length 16-24-87384;
    console.log('cipher.length in decryptSymetricService', cipher.length);
    let nonce = cipher.substring(0, 16);
    let tag = cipher.substring(16, 40);
    let cipherText = cipher.substring(40);
    // 16-24-65496 received
    console.log('nonce', nonce, 'tag', tag, 'cipherText.length', cipherText.length);
    const decipher = createDecipheriv(
      "aes-192-ccm",
      keySalt,
      Buffer.from(nonce, "base64"),
      {
        authTagLength: 16,
      }
    );
  
    decipher.setAuthTag(Buffer.from(tag, "base64"));
  
    const decryptedPlaintext = decipher.update(cipherText, "base64", "utf8");
  
    try {
      decipher.final("utf8");
      return decryptedPlaintext;
    } catch (err) {
      throw new Error("Authentication failed!", { cause: err });
    }
  }

  module.exports = decryptSymetricService;