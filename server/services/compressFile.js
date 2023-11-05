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
    console.log("req.body.file", req.file.size);
    const fileSize = req.file.size;
    const startTimeToCompress = Date.now();

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

    // const writableStream = fs.createWriteStream(
    //   `${pathToFile}/../compressed_files/compressed_${req.file.filename}`
    // );

    class GetBytesQuantity extends Transform {
      constructor(options) {
        super(options);
        this.compressedDataByteLength = 0;
      }

      _transform(chunk, encoding, done) {
        this.compressedDataByteLength = this.compressedDataByteLength +=
          Buffer.byteLength(chunk);
        done();
      }

      _flush(cb) {
        console.log("startTimeToCompress", startTimeToCompress);
        let timeToCompress = Date.now() - startTimeToCompress;
        console.log("timeToCompress", timeToCompress);
        this.push(
          Buffer.from(
            JSON.stringify({
              compressedSize: this.compressedDataByteLength.toString(),
              originalSize: fileSize.toString(),
              timeToCompress: timeToCompress.toString(),
            })
          )
        );
        cb();
      }
    }

    const readableStream = new ReadableStream(
      `${pathToFile}/../../uploads/${req.file.filename}`
    );

    const getBytesQuantity = new GetBytesQuantity();

    async function runCountBytesStream() {
      await pipeline(
        readableStream,
        gzipStream,
        getBytesQuantity,
        res,
        (error) => {
          if (error) {
            console.error(error);
          }

          console.log("Count bytes stream process completed");
        }
      );
    }
    runCountBytesStream();
  } catch (error) {
    console.log("error catched", error);
  }
}

module.exports = { compressFile };
