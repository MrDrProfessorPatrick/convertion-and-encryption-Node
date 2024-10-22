const zlib = require("zlib");
const { Transform } = require("stream");

class DecompressionStream extends Transform {
    constructor(options) {
      super(options);
      this.compressionType = options;
      this.data = [];
    }

    _transform(chunk, encoding, done) {
        try {
            console.log('chunk decompression', chunk)
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

    // _flush(cb){
    //     if(this.compressionType === 'gzip'){
    //         this.push(zlib.gunzipSync(Buffer.concat(this.data)));
    //     }

    //     if(this.compressionType === 'brotli'){
    //         this.push(zlib.brotliDecompressSync(Buffer.concat(this.data)));
    //     }

    //     if(this.compressionType === 'deflate'){
    //         this.push(zlib.deflateRawSync(Buffer.concat(this.data)));
    //     }
    //     cb()
    // }
  }

  module.exports = DecompressionStream;