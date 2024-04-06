const { Readable, Writable, Transform, pipeline } = require("readable-stream");

class EncryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.options = options;
  }

  _transform(chunk, encoding, done) {
    console.log("chunk in encryptSymetricStream", chunk.toString());
    this.push(chunk);
    done();
  }
}

module.exports = new EncryptSymetricStream();
