const { createCipheriv, randomBytes, scryptSync } = require("node:crypto");

function encryptSymetricService(chunk, password) {
  const key = scryptSync(password, 'GfG', 24);
  const iv = randomBytes(16);

  const cipher = createCipheriv('aes-192-cbc', key, iv);

  let ciphertext = cipher.update(chunk, "binary", "hex");
  ciphertext += cipher.final("hex");
  // const tag = cipher.getAuthTag();
  console.log('ciphertext.length encrypted', ciphertext.length)
  // let tagString = tag.toString("base64");
  let result = Buffer.concat([iv, Buffer.from(ciphertext, 'hex')])
  console.log('encryption result', result.length)
  return result;
}

module.exports = encryptSymetricService;

// 65536 firstChunk before encryption
// 26145 secondChunk before encryption 
// 87384 - 87424 firstChunk ENCRYPTED middleLong2.txt
// 34860 secondChunk ENCRYPTED middleLong2.txt


