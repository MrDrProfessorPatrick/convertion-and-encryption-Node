const fs = require("node:fs");
const zlib = require('node:zlib'); 

const CompressionStream = require('../helpers/CompressionStream');
const DecompressionStream = require('../helpers/DecompressionStream');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');
const { pipeline } = require("node:stream/promises");
const uploadsPath = require('../../uploads/uploadsFolderPath');
const DecryptSymetricSplittedStream = require("../helpers/DecryptSymetricSplittedStream");
const { EventEmitter } = require("events");

class TransformFile {

  constructor(compressionMethod, encryptionMethod, password, originalFileSize, fileName, filePath){
    this.compressionMethod = compressionMethod;
    this.encryptionMethod = encryptionMethod;
    this.password = password;
    this.originalFileSize = originalFileSize;
    this.fileName = fileName;
    this.filePath = filePath;
  }

  async compress(res){
    try {

      const compressionInfo = {
        originalSize: this.originalFileSize.toString(),
        deflateCompressionSize: "",
        brotliCompressionSize: "",
        deflateFileName: "",
        brotliFileName: "",
        deflateCompressionTime: "",
        brotliCompressionTime: "",
        encryptedFileName:"",
      };

      const BitesCounter = new EventEmitter();

      BitesCounter
        .on('chunkread',(arg)=>{
          res.write(JSON.stringify(arg))
        })
        .on('chunkreadend',(arg)=>{
          res.write(JSON.stringify(compressionInfo))
          res.end()
        })

      const symetricEncryptionStream = new EncryptSymetricStream({password: this.password, encryptionMethod: this.encryptionMethod});
        
          let startTime = Date.now();
          let fileNameZipped;
          let compressionStream;

          if(this.compressionMethod){
            if(this.compressionMethod === 'deflate'){
              compressionStream = zlib.createGzip();
              fileNameZipped = this.fileName.replace(/\.\w+/, ".gz");
            }

            if(this.compressionMethod === 'brotli'){
              compressionStream = zlib.createBrotliCompress();
              fileNameZipped = this.fileName.replace(/\.\w+/, ".br");
            }
          }

          const readableStream = fs.createReadStream(`${__dirname}/../../uploads/${this.fileName}`);
          const writableStream = fs.createWriteStream(
            `${__dirname}/../../modified_files/${fileNameZipped}`
          );
          let getStreamData = new GetBytesQuantity({compressionMethod:'deflate', compressionInfo, startTime, fileNameZipped:fileNameZipped, bitesCounter:BitesCounter});

          if(!fs.existsSync(`${__dirname}/../../modified_files`)){
            fs.mkdirSync(`${__dirname}/../../modified_files`)
          }     

          await pipeline(
            readableStream,
            compressionStream,
            symetricEncryptionStream,
            getStreamData,
            writableStream
          ).catch((error)=>{
            console.log(error, 'Error in gzip pipeline');
            throw new Error('Error in compress pipeline', error) 
          });     

    } catch (error) {
      throw new Error(error)
    }
  }

  async decompress(readable, writable){
    try {
      let extensionName = this.fileName.split('.').reverse()[0];

      let decompressionStream = null
      
      if(extensionName === 'gz') decompressionStream = zlib.createDeflate();
      if(extensionName === 'br') decompressionStream = zlib.createBrotliDecompress();

      if(decompressionStream === null) throw new Error('No type of decompression was chosen')

      if(this.password){
        let decryptSymetricSplitted = new DecryptSymetricSplittedStream({key:this.password});
        await pipeline(readable, decryptSymetricSplitted, decompressionStream, writable);
      } else {
        await pipeline(readable, decompressionStream, writable);
      }
    } catch (error) {
      console.log(error, 'Error catched in decompress');
      throw new Error(error)
    }
  }

  async encryptSymmetric(){
    try {
      let readableStream = fs.createReadStream(this.filePath);
      let encryptSymetric = new EncryptSymetricStream({password:this.password});
      let encryptedFileName = `encrypted${this.fileName}`;

      if(!fs.existsSync(`${__dirname}/../../modified_files`)){
        fs.mkdirSync(`${__dirname}/../../modified_files`)
      } 

      let writableEncryptionStream = fs.createWriteStream(
        `${__dirname}/../../modified_files/${encryptedFileName}`
      );


      await pipeline(
        readableStream,
        encryptSymetric,
        writableEncryptionStream,
      ).catch((err)=> console.log(err, 'Error in pipeline in encryptSymetric'));
  
      return {encryptedFileName, originalSize: this.originalFileSize}
    } catch (error) {
      console.log(error, 'Error catched in ecryptSymetric')
      throw new Error(error)
    }
  }

  async decryptSymmetric(readable, writable){
    try {
      let decryptSymetricSplitted = new DecryptSymetricSplittedStream({key:this.password});

      await pipeline(readable, decryptSymetricSplitted, writable).catch((error)=>{
        console.log(error, 'Error in decryptSymmetric pipeline');
        throw new Error(error);
      })

    } catch (error) {
      console.log(error, "Error catched in decryptSymmetric")
      throw new Error(error)
    }
  }
}

module.exports = TransformFile;