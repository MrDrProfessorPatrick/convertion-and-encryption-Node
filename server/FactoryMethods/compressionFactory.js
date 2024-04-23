const { Readable } = require("readable-stream");
const zlib = require("zlib");
const fs = require("node:fs");

const pipelineMaker = require('../helpers/pipelineMaker');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');

class Compression {

  constructor(compressionMethods, encryptionMethod){
    this.compressionMethods = compressionMethods;
    this.encryptionMethod = encryptionMethod;
  }

  compress(){
    try{
        let gzipStream ;
        let deflateStream;
        let brotliStream;
        let writableStreamDeflate;
        let writableStreamGzip;
        let writableStreamBrotli;

        const compressionInfo = {
          originalSize: fileSize.toString(),
          gzipCompressionSize: "",
          deflateCompressionSize: "",
          brotliCompressionSize: "",
          zlibTimeToCompress: "",
        };
        // compressionInfo MUST BE RETURNED;

        let fileNameTxt = req.file.filename.replace(/\.\w+/, ".txt");

        // create streamMaker function ?

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

        const readableStream = new ReadableStream(
          `${pathToFile}/../../uploads/${req.file.filename}`
        );

        if(this.compressionMethods.brotli){
          brotliStream = zlib.BrotliCompress();
          writableStreamBrotli = fs.createWriteStream(
            `${pathToFile}/../compressed_files/brotli_compressed_${fileNameTxt}`
          );
        }

        if(this.compressionMethods.gzip){
          gzipStream = zlib.createGzip();
          writableStreamGzip = fs.createWriteStream(
            `${pathToFile}/../compressed_files/gzip_compressed_${fileNameTxt}`
          );
        }

        if(this.compressionMethods.deflate){
           deflateStream = zlib.DeflateRaw();
           writableStreamDeflate = fs.createWriteStream(
            `${pathToFile}/../compressed_files/deflate_compressed_${fileNameTxt}`
          );
        }

        const getBytesQuantityDeflate = new GetBytesQuantity("deflate");
        const getBytesQuantityGzip = new GetBytesQuantity("gzip");
        const getBytesQuantityBrotli = new GetBytesQuantity("brotli");
        // TODO pass compressionInfo to GetBytesQuantity;

          // run pipeline in for of compressionMethods and in the last one return object you need
          async function transformFile(){
            if (this.compressionMethods.deflate) {
              this.encryptionMethod ? 
                pipelineMaker({readableStream, 
                  transformStreams:[EncryptSymetricStream, deflateStream, getBytesQuantityDeflate], 
                  writableStream:writableStreamDeflate
                }) :
                pipelineMaker({readableStream, 
                  transformStreams:[deflateStream, getBytesQuantityDeflate], 
                  writableStream:writableStreamDeflate
                });
            }

            if (this.compressionMethods.gzip) {
              this.encryptionMethod ? 
                pipelineMaker({readableStream, 
                  transformStreams:[EncryptSymetricStream, gzipStream, getBytesQuantityGzip], 
                  writableStream:writableStreamGzip
                }) :
                pipelineMaker({readableStream, 
                  transformStreams:[gzipStream, getBytesQuantityGzip], 
                  writableStream:writableStreamGzip
                });
            }
          

            if (this.compressionMethods.brotli) {
              this.encryptionMethod ? 
                pipelineMaker({readableStream, 
                  transformStreams:[EncryptSymetricStream, brotliStream, getBytesQuantityBrotli], 
                  writableStream:writableStreamBrotli
                }) :
                pipelineMaker({readableStream, 
                  transformStreams:[brotliStream, getBytesQuantityBrotli], 
                  writableStream:writableStreamBrotli
                });
            }
          }

        transformFile.then(() => res.status(200).json(compressionInfo));
      } catch (error) {
        console.log("error catched", error);
      }
    }
}

module.exports = Compression;