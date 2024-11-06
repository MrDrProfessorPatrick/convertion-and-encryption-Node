const { Transform } = require("readable-stream");
const encryptSymetricService = require("./encryptServices");

class EncryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.ivObj = {iv:null};
    this.key = options.password;
    this.encryptionMethod = options.encryptionMethod;
  }
// TODO have only one encryption method thats why only one service;
  _transform(chunk, encoding, done) {
    if(this.key){
      let encryptedChunk = encryptSymetricService(chunk, this.key, this.ivObj);
      this.push(encryptedChunk)
    } else {
      this.push(chunk)
    }
    done();
  }
}

module.exports = EncryptSymetricStream;
