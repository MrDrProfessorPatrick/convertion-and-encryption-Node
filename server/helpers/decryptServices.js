const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");

function decryptSymetricService(cipher, key, iv) {
  try {
    const keySalt = scryptSync(key, "GfG", 24);
    // split by length 16-24-87384;
    // let nonce = cipher.substring(0, 33);
    // let tag = cipher.substring(16, 40);
    // let cipherText = cipher.substring(33);
    // 16-24-65496 received
    const decipher = createDecipheriv('aes-192-cbc', keySalt, iv);
    // compressed and encrypted chunk.length 40
    // decipher.setAuthTag(Buffer.from(tag, "base64"));
    let decryptedPlaintext = decipher.update(cipher, "binary", "hex");
    decryptedPlaintext+=decipher.final("hex");

    return{decrypted: Buffer.from(decryptedPlaintext, 'hex')};

  } catch (err) {
    throw new Error("Authentication failed!", { cause: err });
  }
}

module.exports = decryptSymetricService;

// iv ciphered b48eee81bf1288d6c5b38fc4b1977720
// 
// 