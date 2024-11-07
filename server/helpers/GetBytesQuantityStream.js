const { Transform } = require("readable-stream");

class GetBytesQuantity extends Transform {
    constructor(options) {
      super(options);
      this.compressionMethod = options.compressionMethod;
      this.compressionInfo = options.compressionInfo;
      this.startTime = options.startTime;
      this.fileName = options.fileNameZipped;
      this.compressedDataByteLength = 0;
    }

    _transform(chunk, encoding, done) {
      let delim = Buffer.from('5b7c5d', 'hex');
      this.push(Buffer.concat([chunk, delim]));
      this.compressedDataByteLength += chunk.length;
      done();
    }

    _flush(cb) {
      if (this.compressionMethod === "deflate") {
        this.compressionInfo.deflateCompressionSize =
          this.compressedDataByteLength.toString();
          this.compressionInfo.deflateFileName = `${this.fileName}`;
          this.compressionInfo.deflateCompressionTime = Date.now() - this.startTime;
      }

      if (this.compressionMethod === "gzip") {
        this.compressionInfo.gzipCompressionSize =
          this.compressedDataByteLength.toString();
          this.compressionInfo.gzipFileName = `${this.fileName}`;
          this.compressionInfo.gzipCompressionTime = Date.now() - this.startTime;
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