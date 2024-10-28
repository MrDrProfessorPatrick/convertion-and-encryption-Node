const { Transform } = require("readable-stream");
const { createCipheriv, randomBytes, scryptSync } = require("node:crypto");
const encryptSymetricService = require("./encryptServices");

class EncryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.iv = null;
    this.count = 0;
    this.key = options.password;
    this.encryptionMethod = options.encryptionMethod;
  }
// TODO have only one encryption method thats why only one service;
  _transform(chunk, encoding, done) {
    if(this.iv === null) this.iv = randomBytes(16);
    if(this.key){
      // TODO add chunk length to the start of each chunk
      let encryptedChunk = encryptSymetricService(chunk, this.key, this.iv, this.count);
      this.count++;
 // you don't now the chunk length in bites
      this.push(encryptedChunk)
    } else {
      this.push(chunk)
    }
    done();
  }
}

module.exports = EncryptSymetricStream;
