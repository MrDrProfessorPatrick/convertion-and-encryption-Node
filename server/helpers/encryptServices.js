const {
  createCipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");

function encryptSymetricService(textToEncrypt, key) {
    const keySalt = scryptSync(key, "salt", 24);
    const nonce = randomBytes(12);
  
    const cipher = createCipheriv("aes-192-ccm", keySalt, nonce, {
      authTagLength: 16,
    });
  
    let ciphertext = cipher.update(textToEncrypt, "utf8", "base64");
    ciphertext += cipher.final("base64");
    const tag = cipher.getAuthTag();
    let nonceString = nonce.toString("base64");
  
    let tagString = tag.toString("base64");

    console.log(nonceString.length, tagString.length);
  
    let responseCipher = nonceString + "-" + tagString + "-" + ciphertext + '&&';
    return responseCipher;
  }

  module.exports = encryptSymetricService;