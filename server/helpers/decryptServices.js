const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");
  
  function decryptSymetricService(cipher, key) {
    const keySalt = scryptSync(key, "salt", 24);
  // split by length 16-24-87384;
    let [nonce, tag, cipherText] = cipher.split("-");
  
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