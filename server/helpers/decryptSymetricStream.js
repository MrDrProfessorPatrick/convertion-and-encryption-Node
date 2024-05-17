const {Transform } = require("readable-stream");
const decryptSymetricService = require("./decryptServices");

class DecryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options;
  }
  
  _transform(chunk, encoding, done) {
    this.push(decryptSymetricService(chunk.toString(), this.key));
    done();
  }
}

module.exports = DecryptSymetricStream;
