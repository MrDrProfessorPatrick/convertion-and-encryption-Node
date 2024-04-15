const { Readable, Writable, Transform, pipeline } = require("readable-stream");
const decryptSymetricService = require("./decryptSymetricService");

class DecryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options;
  }
  _transform(chunk, encoding, done) {
    console.log("DecryptSymetricStream chunk", chunk);

    this.push(decryptSymetricService(chunk.toString(), this.key));
    done();
  }
}

module.exports = DecryptSymetricStream;
