const { Transform } = require("readable-stream");

class GetBytesQuantity extends Transform {
    constructor(options) {
      super(options);
      this.options = options;
      this.compressedDataByteLength = 0;
    }

    _transform(chunk, encoding, done) {
      this.compressedDataByteLength = this.compressedDataByteLength +=
        Buffer.byteLength(chunk);
      this.push(chunk);
      done();
    }

    _flush(cb) {
      let timeToCompress = Date.now() - startTimeToCompress;

      if (this.options === "deflate") {
        compressionInfo.deflateCompressionSize =
          this.compressedDataByteLength.toString();
        compressionInfo.deflateFileName = `deflate_compressed_${fileNameDeflate}`;
        // TODO check fileNameDeflate/fileNameGz/fileNameBr
      }

      if (this.options === "gzip") {
        compressionInfo.gzipCompressionSize =
          this.compressedDataByteLength.toString();
        compressionInfo.gzipFileName = `gzip_compressed_${fileNameGz}`;
      }

      if (this.options === "brotli") {
        compressionInfo.brotliCompressionSize =
          this.compressedDataByteLength.toString();
        compressionInfo.brotliFileName = `brotli_compressed_${fileNameBr}`;
      }

      // this.push(
      //   Buffer.from(
      //     JSON.stringify({
      //       compressedSize: this.compressedDataByteLength.toString(),
      //       originalSize: fileSize.toString(),
      //       timeToCompress: timeToCompress.toString(),
      //     })
      //   )
      // );
      cb();
    }
  }

  module.exports = GetBytesQuantity;