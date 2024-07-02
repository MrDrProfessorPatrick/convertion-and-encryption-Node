const zlib = require("zlib");
const { Transform } = require("stream");

class CompressionStream extends Transform {
    constructor(options) {
      super(options);
      this.compressionType = options;
    }

    _transform(chunk, encoding, done) {
      console.log('compression chunk.length', chunk)
      if(this.compressionType === 'gzip'){
        console.log('chunk.length in CompressionStream', chunk.length);
        console.log('compressed and encrypted chunk.length', zlib.gzipSync(chunk).length)

        this.push(zlib.gzipSync(chunk));
      }

      if(this.compressionType === 'brotli'){
        this.push(zlib.brotliCompressSync(chunk));
      }

      if(this.compressionType === 'deflate'){
        this.push(zlib.deflateSync(chunk));
      }
      
      done();
    }
  }

  module.exports = CompressionStream;