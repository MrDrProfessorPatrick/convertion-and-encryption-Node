const { createCipheriv, randomBytes, scryptSync } = require("node:crypto");

function encryptSymetricService(textToEncrypt, password) {
  const key = scryptSync(password, 'GfG', 24);
  const iv = randomBytes(16);

  const cipher = createCipheriv('aes192', key, iv);

  let ciphertext = cipher.update(textToEncrypt, "utf8", "base64");
  ciphertext += cipher.final("base64");
  // const tag = cipher.getAuthTag();
  let nonceString = iv.toString("base64");
  console.log('iv', nonceString)
  // let tagString = tag.toString("base64");

  //6gRuD+E3jEIHVmtnbYZGNw==

  return Buffer.from(nonceString + ciphertext);
}

module.exports = encryptSymetricService;

// 65536 firstChunk before encryption
// 26145 secondChunk before encryption 
// 87384 - 87424 firstChunk ENCRYPTED middleLong2.txt
// 34860 secondChunk ENCRYPTED middleLong2.txt


