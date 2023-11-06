const fs = require("node:fs");
const zlib = require("zlib");
const { Readable, Writable, Transform, pipeline } = require("readable-stream");

async function compressFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json("No File was received");
  }

  try {
    const disposition = 'attachment; filename="' + req.file.filename + '"';
    // res.set("Content-Encoding", "gzip");
    // res.setHeader("Content-Type", req.file.mimetype);
    // res.setHeader("Content-Disposition", disposition);
    const pathToFile = __dirname;
    const gzipStream = zlib.createGzip();
    const deflateStream = zlib.DeflateRaw();
    const brotliStream = zlib.BrotliCompress();

    console.log("req.body", req.body);
    const fileSize = req.file.size;
    const startTimeToCompress = Date.now();

    const compressionInfo = {
      originalSize: fileSize.toString(),
      zlibCompressionSize: "",
      deflateCompressionSize: "",
      brotliCompressionSize: "",
      zlibTimeToCompress: "",
    };

    class ReadableStream extends Readable {
      constructor(options) {
        super(options);
        this.data = fs.readFileSync(options, (err, data) => {
          return data;
        });
        this.start = 0;
        this.chunks = [];
      }

      _read(size, enc, done) {
        const end = this.start + size;
        const chunk = this.data.slice(this.start, end);
        this.start = end;
        this.push(chunk.length ? chunk : null);
      }
    }

    const writableStreamDeflate = fs.createWriteStream(
      `${pathToFile}/../compressed_files/deflate_compressed_${req.file.filename}`
    );

    const writableStreamZlib = fs.createWriteStream(
      `${pathToFile}/../compressed_files/zlib_compressed_${req.file.filename}`
    );

    const writableStreamBrotli = fs.createWriteStream(
      `${pathToFile}/../compressed_files/brotli_compressed_${req.file.filename}`
    );

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
        console.log("startTimeToCompress", startTimeToCompress);
        let timeToCompress = Date.now() - startTimeToCompress;
        console.log("options", this.options);

        if (this.options === "deflate") {
          compressionInfo.deflateCompressionSize =
            this.compressedDataByteLength.toString();
        }

        if (this.options === "zlib") {
          compressionInfo.zlibCompressionSize =
            this.compressedDataByteLength.toString();
        }

        if (this.options === "brotli") {
          compressionInfo.brotliCompressionSize =
            this.compressedDataByteLength.toString();
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

    const readableStream = new ReadableStream(
      `${pathToFile}/../../uploads/${req.file.filename}`
    );

    const getBytesQuantityDeflate = new GetBytesQuantity("deflate");
    const getBytesQuantityZlib = new GetBytesQuantity("zlib");
    const getBytesQuantityBrotli = new GetBytesQuantity("brotli");

    function runCountBytesStream(compressionMethods) {
      // run pipeline in for of compressionMethods and in the last one return object you need
      for (let i = 0; i <= compressionMethods.length; i++) {
        if (compressionMethods[i] === "deflate") {
          pipeline(
            readableStream,
            deflateStream,
            getBytesQuantityDeflate,
            writableStreamDeflate,
            (error) => {
              if (error) {
                console.error("Error catched in Deflate", error);
              }
              if (i === compressionMethods.length - 1) {
                return res.status(200).json(compressionInfo);
              }
            }
          );
        }

        if (compressionMethods[i] === "gzip") {
          pipeline(
            readableStream,
            gzipStream,
            getBytesQuantityZlib,
            writableStreamZlib,
            (error) => {
              if (error) {
                console.error("Error catched in Deflate", error);
              }
              if (i === compressionMethods.length - 1) {
                return res.status(200).json(compressionInfo);
              }
            }
          );
        }

        if (compressionMethods[i] === "brotli") {
          pipeline(
            readableStream,
            brotliStream,
            getBytesQuantityBrotli,
            writableStreamBrotli,
            (error) => {
              if (error) {
                console.error("Error catched in Deflate", error);
              }
              if (i === compressionMethods.length - 1) {
                return res.status(200).json(compressionInfo);
              }
            }
          );
        }
      }
    }

    runCountBytesStream(["deflate", "gzip", "brotli"]);
  } catch (error) {
    console.log("error catched", error);
  }
}

module.exports = { compressFile };
