const zlib = require("zlib");
const { Transform } = require("stream");

class CompressionStream extends Transform {
    constructor(options) {
      super(options);
      this.compressionType = options;
    }

    _transform(chunk, encoding, done) {
      if(this.compressionType === 'gzip'){
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