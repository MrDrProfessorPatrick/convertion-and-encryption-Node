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
    let compressionMethods = [];

    const fileSize = req.file.size;
    const startTimeToCompress = Date.now();

    if (req.body.gzip === "true") compressionMethods.push("gzip");
    if (req.body.deflate === "true") compressionMethods.push("deflate");
    if (req.body.brotli === "true") compressionMethods.push("brotli");

    const compressionInfo = {
      originalSize: fileSize.toString(),
      gzipCompressionSize: "",
      deflateCompressionSize: "",
      brotliCompressionSize: "",
      zlibTimeToCompress: "",
    };

    let fileNameTxt = req.file.filename.replace(/\.\w+/, ".txt");

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
      `${pathToFile}/../compressed_files/deflate_compressed_${fileNameTxt}`
    );

    const writableStreamZlib = fs.createWriteStream(
      `${pathToFile}/../compressed_files/gzip_compressed_${fileNameTxt}`
    );

    const writableStreamBrotli = fs.createWriteStream(
      `${pathToFile}/../compressed_files/brotli_compressed_${fileNameTxt}`
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
        let timeToCompress = Date.now() - startTimeToCompress;

        if (this.options === "deflate") {
          compressionInfo.deflateCompressionSize =
            this.compressedDataByteLength.toString();
          compressionInfo.deflateFileName = `deflate_compressed_${fileNameDeflate}`;
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

    const readableStream = new ReadableStream(
      `${pathToFile}/../../uploads/${req.file.filename}`
    );

    const getBytesQuantityDeflate = new GetBytesQuantity("deflate");
    const getBytesQuantityGzip = new GetBytesQuantity("gzip");
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
            getBytesQuantityGzip,
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

    runCountBytesStream(compressionMethods);
  } catch (error) {
    console.log("error catched", error);
  }
}

module.exports = { compressFile };
