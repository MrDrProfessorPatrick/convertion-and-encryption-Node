const fs = require("node:fs");
const zlib = require('node:zlib'); 

const CompressionStream = require('../helpers/CompressionStream');
const DecompressionStream = require('../helpers/DecompressionStream');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');
const { pipeline } = require("node:stream/promises");
const uploadsPath = require('../../uploads/uploadsFolderPath');
const DecryptSymetricSplittedStream = require("../helpers/DecryptSymetricSplittedStream");
const createBitesCounter = require('../helpers/createBitesCounter');
class TransformFile {

  constructor(compressionMethod, encryptionMethod, password, originalFileSize, fileName, filePath){
    this.compressionMethod = compressionMethod;
    this.encryptionMethod = encryptionMethod;
    this.password = password;
    this.originalFileSize = originalFileSize;
    this.fileName = fileName;
    this.filePath = filePath;
  }

  async compress(readableStream, res){
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

      const symetricEncryptionStream = new EncryptSymetricStream({password: this.password, encryptionMethod: this.encryptionMethod});

      let compressionStream;
      let fileNameZipped;
      
        if(this.compressionMethod){
          if(this.compressionMethod === 'deflate'){
            compressionStream = zlib.createDeflate();
            fileNameZipped = this.fileName.replace(/\.\w+/, ".gz");
          }

          if(this.compressionMethod === 'brotli'){
            compressionStream = zlib.createBrotliCompress();
            fileNameZipped = this.fileName.replace(/\.\w+/, ".br");
          }
        }
        console.log('compressionStream', compressionStream)
        let bitesCounter = createBitesCounter(res, compressionInfo);

        const writableStream = fs.createWriteStream(
          `${__dirname}/../../modified_files/${fileNameZipped}`
        );

        let startTime = Date.now();
        let getStreamData = new GetBytesQuantity({compressionMethod:this.compressionMethod, compressionInfo, startTime, fileNameZipped:fileNameZipped, bitesCounter});

        if(!fs.existsSync(`${__dirname}/../../modified_files`)){
          fs.mkdirSync(`${__dirname}/../../modified_files`)
        }

        pipeline(
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
      
      if(extensionName === 'gz') decompressionStream = zlib.createInflate();
      if(extensionName === 'br') decompressionStream = zlib.createBrotliDecompress();
      if(decompressionStream === null) throw new Error('No type of decompression was chosen')
      if(this.password){
        let decryptSymetricSplitted = new DecryptSymetricSplittedStream({key:this.password});
        await pipeline(readable, decryptSymetricSplitted, decompressionStream, writable);
      } else {
        await pipeline(readable, decompressionStream, writable);
      }
      writable.end()
    } catch (error) {
      console.log(error, 'Error catched in decompress');
      throw new Error(error)
    }
  }

  async encryptSymmetric(readableStream, res){
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

      let encryptSymetric = new EncryptSymetricStream({password:this.password});
      compressionInfo.encryptedFileName = `encrypted${this.fileName}`;

      if(!fs.existsSync(`${__dirname}/../../modified_files`)){
        fs.mkdirSync(`${__dirname}/../../modified_files`)
      };

      let bitesCounter = createBitesCounter(res, compressionInfo);
      let startTime = Date.now();
      let getStreamData = new GetBytesQuantity({compressionMethod:this.compressionMethod, compressionInfo, startTime, fileNameZipped:this.fileName, bitesCounter});

      let writableEncryptionStream = fs.createWriteStream(
        `${__dirname}/../../modified_files/${compressionInfo.encryptedFileName}`
      );

      await pipeline(
        readableStream,
        encryptSymetric,
        getStreamData,
        writableEncryptionStream,
      ).catch((err)=> console.log(err, 'Error in pipeline in encryptSymetric'));
  
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