const zlib = require("zlib");
const { Transform } = require("stream");

class CompressionStream extends Transform {
    constructor(options) {
      super(options);
      this.compressionType = options;
    }

    _transform(chunk, encoding, done) {
      if(this.compressionType === 'gzip'){
        this.push(zlib.gzipSync(chunk).toString('base64'));
      }

      if(this.compressionType === 'brotli'){
        this.push(zlib.brotliCompressSync(chunk).toString('base64'));
      }

      if(this.compressionType === 'deflate'){
        this.push(zlib.deflateSync(chunk).toString('base64'));
      }
      done();
    }
  }

  module.exports = CompressionStream;