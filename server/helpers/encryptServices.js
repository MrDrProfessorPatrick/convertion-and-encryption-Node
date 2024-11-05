const { createCipheriv, randomBytes, scryptSync } = require("node:crypto");

function encryptSymetricService(chunk, password, ivObj) {
  let result;
  let firstIv = false
  if(ivObj.iv === null){
    ivObj.iv = randomBytes(16);
    firstIv = true;
  }

  const key = scryptSync(password, 'GfG', 24);
  const cipher = createCipheriv('aes-192-cbc', key, ivObj.iv);

  let ciphertext = cipher.update(chunk, "binary", "hex");
  ciphertext += cipher.final("hex");
  // const tag = cipher.getAuthTag();
  console.log('ciphertext.length encrypted', ciphertext.length)
  // let tagString = tag.toString("base64");
  let delim = Buffer.from('|');

  if(firstIv){
  console.log('iv ciphered', ivObj.iv.toString('hex'))
    result = Buffer.concat([ivObj.iv, delim, Buffer.from(ciphertext, 'hex')])
  } else {
    result = Buffer.from(ciphertext, 'hex')
  }
  return result;
}

module.exports = encryptSymetricService;



