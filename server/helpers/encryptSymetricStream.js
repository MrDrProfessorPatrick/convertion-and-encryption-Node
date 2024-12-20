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
    try {
      if(this.key){
        let encryptedChunk = encryptSymetricService(chunk, this.key, this.ivObj);
        let delim = Buffer.from('5b7c5d', 'hex');
        this.push(Buffer.concat([encryptedChunk, delim]));
      } else {
        this.push(chunk)
      }
      done();
    } catch (error) {
      console.log('Error catched in EncryptSymetricStream', error)
    }

  }
}

module.exports = EncryptSymetricStream;
