const { Transform } = require("readable-stream");

function changeCompressionInfo(compressionMethod, compressionInfo, compressedDataByteLength, startTime, fileName){
  if (compressionMethod === "deflate") {
    compressionInfo.deflateCompressionSize =
      compressedDataByteLength.toString();
      compressionInfo.deflateFileName = `${fileName}`;
      compressionInfo.deflateCompressionTime = Date.now() - startTime;
  }

  if (compressionMethod === "brotli") {
    compressionInfo.brotliCompressionSize =
      compressedDataByteLength.toString();
      compressionInfo.brotliFileName = `${fileName}`;
      compressionInfo.brotliCompressionTime = Date.now() - startTime;
  }
}
class GetBytesQuantity extends Transform {
  constructor(options) {
    super(options);
    this.compressionMethod = options.compressionMethod;
    this.compressionInfo = options.compressionInfo;
    this.startTime = options.startTime;
    this.fileName = options.fileNameZipped;
    this.bitesCounter = options.bitesCounter;
    this.compressedDataByteLength = 0;
  }

  _transform(chunk, encoding, done) {
    this.compressedDataByteLength += chunk.length;
    changeCompressionInfo(this.compressionMethod, this.compressionInfo, this.compressedDataByteLength, this.startTime, this.fileName);
    this.bitesCounter.emit('chunkread', this.compressionInfo);
    this.push(chunk);
    done();
  }

  _flush(cb) {
    changeCompressionInfo(this.compressionMethod, this.compressionInfo, this.compressedDataByteLength, this.startTime, this.fileName);
    this.bitesCounter.emit('chunkreadend', this.compressionInfo);
    cb();
  }
}



  module.exports = GetBytesQuantity;