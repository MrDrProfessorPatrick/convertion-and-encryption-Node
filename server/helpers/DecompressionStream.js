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
                this.push(zlib.gunzipSync(chunk).toString('utf8'));
            }
        
            if(this.compressionType === 'brotli'){
                this.push(zlib.brotliDecompressRawSync(chunk).toString('utf8'));
            }
        
            if(this.compressionType === 'deflate'){
                this.push(zlib.deflateRawSync(chunk).toString('utf8'));
            }

            done();

        } catch (error) {
            console.log('Error catched in _transform DecompressionStream', error)
        }
    }
  }

  module.exports = DecompressionStream;