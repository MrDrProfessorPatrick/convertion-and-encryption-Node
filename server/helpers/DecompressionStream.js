const zlib = require("zlib");
const { Transform } = require("stream");

class DecompressionStream extends Transform {
    constructor(options) {
      super(options);
      this.compressionType = options;
    }

    _transform(chunk, encoding, done) {
        try {
            if(this.compressionType === 'gzip'){
                let gzipDecompressed = zlib.gunzipSync(chunk);
                this.push(gzipDecompressed);
            }

            if(this.compressionType === 'brotli'){
                this.push(zlib.brotliDecompressSync(chunk));
            }

            if(this.compressionType === 'deflate'){
                this.push(zlib.deflateRawSync(chunk));
            }

            done();
        } catch (error) {
            console.log('Error catched in _transform DecompressionStream', error)
        }
    }
  }

  module.exports = DecompressionStream;