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
      // TODO add chunk length to the start of each chunk
      console.log('this.iv in encryptsymetric stream', this.ivObj.iv && this.ivObj.iv.toString('hex'))
      let encryptedChunk = encryptSymetricService(chunk, this.key, this.ivObj);
    
 // you don't now the chunk length in bites
      this.push(encryptedChunk)
    } else {
      this.push(chunk)
    }
    done();
  }
}

module.exports = EncryptSymetricStream;
