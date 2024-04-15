const { Readable, Writable, Transform, pipeline } = require("readable-stream");
const encryptSymetricService = require("./encryptServices");

class EncryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options;
  }

  _transform(chunk, encoding, done) {
    this.push(encryptSymetricService(chunk.toString(), this.key));
    done();
  }
}

module.exports = EncryptSymetricStream;
