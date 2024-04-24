const { Transform } = require("readable-stream");

class GetBytesQuantity extends Transform {
    constructor(options) {
      super(options);
      this.compressionMethod = options.compressionMethod;
      this.compressionInfo = options.compressionInfo;
      this.compressedDataByteLength = 0;
    }

    _transform(chunk, encoding, done) {
      this.compressedDataByteLength = this.compressedDataByteLength +=
        Buffer.byteLength(chunk);
      this.push(chunk);
      done();
    }

    _flush(cb) {
      // let timeToCompress = Date.now() - startTimeToCompress;

      if (this.compressionMethod  === "deflate") {
        this.compressionInfo.deflateCompressionSize =
          this.compressedDataByteLength.toString();
          // this.compressionInfo.deflateFileName = `deflate_compressed_${fileNameDeflate}`;
        // TODO check fileNameDeflate/fileNameGz/fileNameBr
      }

      if (this.compressionMethod  === "gzip") {
        this.compressionInfo.gzipCompressionSize =
          this.compressedDataByteLength.toString();
          // this.compressionInfo.gzipFileName = `gzip_compressed_${fileNameGz}`;
      }

      if (this.compressionMethod  === "brotli") {
        this.compressionInfo.brotliCompressionSize =
          this.compressedDataByteLength.toString();
          // this.compressionInfo.brotliFileName = `brotli_compressed_${fileNameBr}`;
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