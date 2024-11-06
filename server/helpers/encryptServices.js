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
  // let tagString = tag.toString("base64");
  let delim = Buffer.from('5b7c5d', 'hex');

  if(Buffer.from(ciphertext, 'hex').indexOf('5b7c5d', 0, 'hex') !== -1){
    throw new Error('[|] delimiter was found in ciphered text/ integrity of chunk was damaged')
  }


  if(firstIv){
    result = Buffer.concat([ivObj.iv, delim, Buffer.from(ciphertext, 'hex')])
  } else {
    result = Buffer.from(ciphertext, 'hex')
  }
  return result;
}

module.exports = encryptSymetricService;



