const zlib = require("zlib");
const { Transform } = require("stream");

class DecompressionStream extends Transform {
    constructor(options) {
      super(options);
      this.compressionType = options.compressionType;
    }

    _transform(chunk, encoding, done) {
        try {
            if(this.compressionType === 'gz'){
                let gzipDecompressed = zlib.inflateSync(chunk);
                console.log('IS NEVER PUSHED')
                 this.push(gzipDecompressed)
            }

            if(this.compressionType === 'br'){
                this.push(zlib.brotliDecompressSync(chunk));
            }

            done();
        } catch (error) {
            console.log('Error catched in _transform DecompressionStream', error);
            done(error)
        }
    }
  }

  module.exports = DecompressionStream;