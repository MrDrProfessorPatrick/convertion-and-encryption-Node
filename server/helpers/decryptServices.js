const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");

function decryptSymetricService(cipher, key) {
  try {
    const keySalt = scryptSync(key, "GfG", 24);
    // split by length 16-24-87384;
    let nonce = cipher.substring(0, 17);
    // let tag = cipher.substring(16, 40);
    let cipherText = cipher.substring(17);
    // propably you make cipher for tag and nonce and that's why it doesn't work
    
    console.log('cipher', cipher, 'nonce=', nonce)

    // 16-24-65496 received
    const decipher = createDecipheriv(
      "aes192",
      keySalt,
      Buffer.from(nonce, "base64")
      // {
      //   authTagLength: 16,
      // }
    );

    decipher.setAuthTag(Buffer.from(tag, "base64"));

    const decryptedPlaintext = decipher.update(cipherText, "base64", "utf8");
    decipher.final("utf8");

    return decryptedPlaintext;

  } catch (err) {
    throw new Error("Authentication failed!", { cause: err });
  }
}

module.exports = decryptSymetricService;