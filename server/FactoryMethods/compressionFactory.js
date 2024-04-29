const { Readable } = require("readable-stream");
const zlib = require("zlib");
const fs = require("node:fs");

const pipelineMaker = require('../helpers/pipelineMaker');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');
const { pipeline } = require("node:stream/promises");

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
        let innerThis = this;

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

        const symetricEncryptionStream = new EncryptSymetricStream(this.password, this.encryptionMethod);

          async function pipelineCompressor(){
            for await(let method of innerThis.compressionMethods){

              if(method === 'deflate'){
                let startTime = Date.now();
                let getStreamData = new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped:fileNameTxt});

                await pipeline(
                  readableStream, 
                  symetricEncryptionStream, 
                  deflateStream, 
                  getStreamData, 
                  writableStreamDeflate
                );
              }  

            if (method === 'gzip') {
              let startTime = Date.now();
              let getStreamData = new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped:fileNameTxt});

              await pipeline(
                readableStream, 
                symetricEncryptionStream, 
                gzipStream, 
                getStreamData, 
                writableStreamGzip
              );
            }

            if (method === 'brotli') {
              let startTime = Date.now();
              let getStreamData = new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped:fileNameTxt});

              await pipeline(
                readableStream, 
                symetricEncryptionStream, 
                brotliStream, 
                getStreamData, 
                writableStreamBrotli
              );
            }

          }
        
        return compressionInfo;
      }

      let compressionInfoResult = await pipelineCompressor();
      return compressionInfoResult;
        
    } catch (error) {
      console.log("error catched", error);
    }
  }
}

module.exports = Compression;