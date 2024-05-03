const { Transform } = require("readable-stream");
const encryptSymetricService = require("./encryptServices");

class EncryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options.password;
    this.encryptionMethod = options.encryptionMethod;
  }
// TODO have only one encryption method thats why only one service;
  _transform(chunk, encoding, done) {
   console.log('chunk in EncryptSymetricStream', chunk)
   this.key ? this.push(encryptSymetricService(chunk.toString(), this.key)) : this.push(chunk);
   done();
  }
}

module.exports = EncryptSymetricStream;
