const { Transform } = require("readable-stream");
const encryptSymetricService = require("./encryptServices");

class EncryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.chunkCount = 0;
    this.key = options.password;
    this.encryptionMethod = options.encryptionMethod;
  }
// TODO have only one encryption method thats why only one service;
  _transform(chunk, encoding, done) {
    console.log('encrytption chunk.length', chunk.length)

   this.key ? this.push(encryptSymetricService(chunk, this.key)) : this.push(chunk);
   done();
  }
}

module.exports = EncryptSymetricStream;
