const { Transform } = require("readable-stream");

class GetBytesQuantity extends Transform {
    constructor(options) {
      super(options);
      this.compressionMethod = options.compressionMethod;
      this.compressionInfo = options.compressionInfo;
      this.startTime = options.startTime;
      this.fileName = options.fileNameZipped;
      this.compressedDataByteLength = 0;
      this.bitesCounter = options.bitesCounter;
    }

    _transform(chunk, encoding, done) {
      this.bitesCounter.emit('chunkread', 'CUSTOM CHUNK READ')
      this.compressedDataByteLength += chunk.length;
      this.push(chunk)
      done();
    }

    _flush(cb) {
      this.bitesCounter.emit('chunkreadend', 'CHUNK READ END')
      if (this.compressionMethod === "deflate") {
        this.compressionInfo.deflateCompressionSize =
          this.compressedDataByteLength.toString();
          this.compressionInfo.deflateFileName = `${this.fileName}`;
          this.compressionInfo.deflateCompressionTime = Date.now() - this.startTime;
      }

      if (this.compressionMethod === "brotli") {
        this.compressionInfo.brotliCompressionSize =
          this.compressedDataByteLength.toString();
          this.compressionInfo.brotliFileName = `${this.fileName}`;
          this.compressionInfo.brotliCompressionTime = Date.now() - this.startTime;
      }
      cb();
    }
  }

  module.exports = GetBytesQuantity;