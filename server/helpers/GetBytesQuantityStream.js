const { Transform } = require("readable-stream");

class GetBytesQuantity extends Transform {
    constructor(options) {
      super(options);
      this.compressionMethod = options.compressionMethod;
      this.compressionInfo = options.compressionInfo;
      this.startTime = options.startTime;
      this.fileName = options.fileNameZipped;
    }

    _transform(chunk, encoding, done) {
      console.log('chunk length', Buffer.byteLength(chunk))
      let len = Buffer.from(Buffer.byteLength(chunk).toString());
      let delim = Buffer.from('-')
      this.push(Buffer.concat([len, delim, chunk]));
      done();
    }
// add bytes quantity to the start of each chunk
    _flush(cb) {
      if (this.compressionMethod === "deflate") {
        this.compressionInfo.deflateCompressionSize =
          this.compressedDataByteLength.toString();
          this.compressionInfo.deflateFileName = `deflate_compressed_${this.fileName}`;
          this.compressionInfo.deflateCompressionTime = Date.now() - this.startTime;
      }

      if (this.compressionMethod === "gzip") {
        this.compressionInfo.gzipCompressionSize =
          // this.compressedDataByteLength.toString();
          this.compressionInfo.gzipFileName = `gzip_compressed_${this.fileName}`;
          this.compressionInfo.gzipCompressionTime = Date.now() - this.startTime;
      }

      if (this.compressionMethod === "brotli") {
        this.compressionInfo.brotliCompressionSize =
          this.compressedDataByteLength.toString();
          this.compressionInfo.brotliFileName = `brotli_compressed_${this.fileName}`;
          this.compressionInfo.brotliCompressionTime = Date.now() - this.startTime;
      }
      cb();
    }
  }

  module.exports = GetBytesQuantity;