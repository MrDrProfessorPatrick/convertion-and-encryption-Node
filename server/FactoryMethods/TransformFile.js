const { Readable } = require("readable-stream");
const fs = require("node:fs");

const CompressionStream = require('../helpers/CompressionStream');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');
const { pipeline } = require("node:stream/promises");

class TransformFile {

  constructor(compressionMethods, encryptionMethod, password, originalFileSize, fileName, filePath){
    this.compressionMethods = compressionMethods;
    this.encryptionMethod = encryptionMethod;
    this.password = password;
    this.originalFileSize = originalFileSize;
    this.fileName = fileName;
    this.filePath = filePath
  }

  async compress(){
    try {
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
          encryptedFileName:"",
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

        const symetricEncryptionStream = new EncryptSymetricStream({password: this.password, encryptionMethod: this.encryptionMethod});

          async function pipelineCompressor(){
            for await(let method of innerThis.compressionMethods){

              if(method === 'deflate'){
                let startTime = Date.now();
                let getStreamData = new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped:fileNameTxt});
                let compressionStream = new CompressionStream('deflate');
                let writableStream = fs.createWriteStream(
                  `${pathToFile}/../../compressed_files/deflate_compressed_${fileNameZipped}`
                );

                await pipeline(
                  readableStream, 
                  symetricEncryptionStream, 
                  compressionStream, 
                  getStreamData, 
                  writableStream
                );
              }  

            if (method === 'gzip') {
              let startTime = Date.now();
              let getStreamData = new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped:fileNameTxt});
              let compressionStream = new CompressionStream('gzip');
              let writableStream = fs.createWriteStream(
                `${pathToFile}/../../compressed_files/gzip_compressed_${fileNameZipped}`
              );

              await pipeline(
                readableStream, 
                symetricEncryptionStream, 
                compressionStream, 
                getStreamData, 
                writableStream
              );
            }

            if (method === 'brotli') {
              let startTime = Date.now();
              let getStreamData = new GetBytesQuantity({compressionMethod:method, compressionInfo, startTime, fileNameZipped:fileNameTxt});
              let compressionStream = new CompressionStream('brotli');
              let writableStream = fs.createWriteStream(
                `${pathToFile}/../../compressed_files/brotli_compressed_${fileNameZipped}`
              );

              await pipeline(
                readableStream, 
                symetricEncryptionStream, 
                compressionStream, 
                getStreamData, 
                writableStream
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

  async encryptSymmetric(){
    try {
      let readableStream = fs.createReadStream(this.filePath);
      let encryptSymetric = new EncryptSymetricStream({password:this.password});
      let writableEncryptionStream = fs.createWriteStream(
        `${__dirname}/../../encrypted_files/encrypted${this.fileName}`
      );
      let encryptedFileName = `encrypted${this.fileName}`;

      await pipeline(
        readableStream,
        encryptSymetric,
        writableEncryptionStream,
      ).catch((err)=> console.log(err, 'Error in pipeline in encryptSymetric'));
  
      return {encryptedFileName, originalSize: this.originalFileSize}
    } catch (error) {
      console.log(error, 'Error catched in ecryptSymetric')
    }

  }
}

module.exports = TransformFile;