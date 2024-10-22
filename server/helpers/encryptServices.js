const { createCipheriv, randomBytes, scryptSync } = require("node:crypto");

function encryptSymetricService(textToEncrypt, key) {
  const keySalt = scryptSync(key, "salt", 24);
  const nonce = randomBytes(12);

  const cipher = createCipheriv("aes192", keySalt, nonce);

  let ciphertext = cipher.update(textToEncrypt, "utf8", "base64");
  ciphertext += cipher.final("base64");
  // const tag = cipher.getAuthTag();
  let nonceString = nonce.toString("base64");
  // let tagString = tag.toString("base64");

  return Buffer.from(nonceString + ciphertext);
}

module.exports = encryptSymetricService;

// 65536 firstChunk before encryption
// 26145 secondChunk before encryption 
// 87384 - 87424 firstChunk ENCRYPTED middleLong2.txt
// 34860 secondChunk ENCRYPTED middleLong2.txt


