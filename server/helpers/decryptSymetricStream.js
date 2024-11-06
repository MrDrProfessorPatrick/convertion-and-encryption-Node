const { Transform } = require("readable-stream");
const decryptSymetricService = require("./decryptServices");

class DecryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options.key;
    this.currentIv = null;
    this.encryptionMethod = options.encryptionMethod;
  }
  
  _transform(chunk, encoding, done) {
      try {
        let {iv, decrypted} = this.key ? decryptSymetricService(chunk, this.key) : null;
        this.currentIv = iv;
        decrypted ? this.push(decrypted) : this.push(chunk.toString());
        done();
      } catch (error) {
          console.log(error, 'Error catch in DecryptSymetricStream')
      }
    }
}

module.exports = DecryptSymetricStream;
