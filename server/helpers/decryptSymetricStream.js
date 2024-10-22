const { Transform } = require("readable-stream");
const decryptSymetricService = require("./decryptServices");

class DecryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options.key;
    this.encryptionMethod = options.encryptionMethod;
  }
  
  _transform(chunk, encoding, done) {
      try {
        console.log('DecryptSymetricStream', DecryptSymetricStream)
        let decryptedString = this.key ? decryptSymetricService(chunk, this.key) : null;
        decryptedString ? this.push(decryptedString) : this.push(chunk.toString());
        done();
      } catch (error) {
          console.log(error, 'Error catch in DecryptSymetricStream')
      }

    }
}

module.exports = DecryptSymetricStream;
