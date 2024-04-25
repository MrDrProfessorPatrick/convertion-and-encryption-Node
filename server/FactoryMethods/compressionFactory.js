const { Readable } = require("readable-stream");
const zlib = require("zlib");
const fs = require("node:fs");

const pipelineMaker = require('../helpers/pipelineMaker');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');

class Compression {

  constructor(compressionMethods, encryptionMethod, password, originalFileSize, fileName){
    this.compressionMethods = compressionMethods;
    this.encryptionMethod = encryptionMethod;
    this.password = password;
    this.originalFileSize = originalFileSize;
    this.fileName = fileName;
  }

  async compress(){
    try {
        let gzipStream ;
        let deflateStream;
        let brotliStream;
        let writableStreamDeflate;
        let writableStreamGzip;
        let writableStreamBrotli;

        const pathToFile = __dirname;

        const compressionInfo = {
          originalSize: this.originalFileSize.toString(),
          gzipCompressionSize: "",
          deflateCompressionSize: "",
          brotliCompressionSize: "",
          gzipFileName: "",
          deflateFileName: "",
          brotliFileName: "",
          gzipCompressionTime: "",
          deflateCompressionTime: "",
          brotliCompressionTime: "",
        };

        let fileNameTxt = this.fileName.replace(/\.\w+/, ".txt");
        let fileNameZipped = this.fileName.replace(/\.\w+/, ".gz");

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
          `${pathToFile}/../../uploads/${this.fileName}`
        );

        if(this.compressionMethods.includes('brotli')){
          brotliStream = zlib.BrotliCompress();
          writableStreamBrotli = fs.createWriteStream(
            `${pathToFile}/../../compressed_files/brotli_compressed_${fileNameTxt}`
          );
        }

        if(this.compressionMethods.includes('gzip')){
          gzipStream = zlib.createGzip();
          writableStreamGzip = fs.createWriteStream(
            `${pathToFile}/../../compressed_files/gzip_compressed_${fileNameTxt}`
          );
        }

        if(this.compressionMethods.includes('deflate')){
           deflateStream = zlib.DeflateRaw();
           writableStreamDeflate = fs.createWriteStream(
            `${pathToFile}/../../compressed_files/deflate_compressed_${fileNameTxt}`
          );
        }

        const symetricEncryptionStream = new EncryptSymetricStream(this.password);

          async function transformFile(compresionMethods, encryptionMethod){

            compresionMethods.forEach((method) =>{
              if (method === 'deflate') {
                let startTime = Date.now();
                encryptionMethod ? 
                  pipelineMaker({readableStream, 
                    transformStreams:[
                      symetricEncryptionStream, 
                      deflateStream, 
                      new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped})], 
                    writableStream: writableStreamDeflate
                  }) :
                  pipelineMaker({readableStream, 
                    transformStreams:[deflateStream, getBytesQuantityDeflate], 
                    writableStream: writableStreamDeflate
                  });
              }

              if (method === 'gzip') {
                let startTime = Date.now();
                encryptionMethod ? 
                  pipelineMaker({readableStream, 
                    transformStreams:[
                      symetricEncryptionStream,
                      gzipStream,
                      new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped})], 
                    writableStream: writableStreamGzip
                  }) :
                  pipelineMaker({readableStream, 
                    transformStreams:[gzipStream, getBytesQuantityGzip], 
                    writableStream: writableStreamGzip
                  });
              }

              if (method ===  'brotli') {
                let startTime = Date.now();
                encryptionMethod ? 
                  pipelineMaker({readableStream, 
                    transformStreams:[
                      symetricEncryptionStream,
                      brotliStream,
                      new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped})], 
                    writableStream: writableStreamBrotli
                  }) :
                  pipelineMaker({readableStream, 
                    transformStreams:[brotliStream, getBytesQuantityBrotli], 
                    writableStream: writableStreamBrotli
                  });
              }
            })
          }

          await  transformFile(this.compressionMethods, this.encryptionMethod);
          
          return compressionInfo;
      } catch (error) {
        console.log("error catched", error);
      }
    }
}

module.exports = Compression;