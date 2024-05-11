const {Transform } = require("readable-stream");
const decryptSymetricService = require("./decryptServices");

class DecryptSymetricStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options;
  }
  
  _transform(chunk, encoding, done) {
    console.log("DecryptSymetricStream chunk.length", chunk.length, );

    
// chunk.toString("base64") -> the same length but different text -> doesn't work at all
//  chunk.toString("utf8") -> doesn't work with slavik letters and doesn't work with the long text
    this.push(decryptSymetricService(chunk.toString(), this.key));
    done();
  }
}

module.exports = DecryptSymetricStream;
