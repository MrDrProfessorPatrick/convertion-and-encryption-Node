const fs = require("node:fs");
const zlib = require('node:zlib'); 

const CompressionStream = require('../helpers/CompressionStream');
const DecompressionStream = require('../helpers/DecompressionStream');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');
const { pipeline } = require("node:stream/promises");
const uploadsPath = require('../../uploads/uploadsFolderPath');
const DecryptSymetricSplittedStream = require("../helpers/DecryptSymetricSplittedStream");

class TransformFile {

  constructor(compressionMethods, encryptionMethod, password, originalFileSize, fileName, filePath){
    this.compressionMethods = compressionMethods;
    this.encryptionMethod = encryptionMethod;
    this.password = password;
    this.originalFileSize = originalFileSize;
    this.fileName = fileName;
    this.filePath = filePath;
  }

  async compress(){
    try {
      let innerThis = this;

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


      const symetricEncryptionStream = new EncryptSymetricStream({password: this.password, encryptionMethod: this.encryptionMethod});
        
      async function pipelineCompressor(){
        try {
          let startTime = Date.now();
          let fileNameZipped = innerThis.fileName.replace(/\.\w+/, ".gz");
          let getStreamData = new GetBytesQuantity({compressionMethod:'gzip', compressionInfo, startTime, fileNameZipped:fileNameZipped});
          // let compressionStream = new CompressionStream('gzip');
          let compressionStream = zlib.createGzip();

          const readableStream = fs.createReadStream(`${__dirname}/../../uploads/${innerThis.fileName}`);
          const writableStream = fs.createWriteStream(
            `${__dirname}/../../modified_files/${fileNameZipped}`
          );

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

        return compressionInfo;

        } catch (error) {
          throw new Error('Error on compressing file')
      }
    }

    let compressionInfoResult = await pipelineCompressor();
    return compressionInfoResult;
        
    } catch (error) {
      throw new Error('Error thrown by TransformFile.compress',error)
    }
  }

  async decompress(readable, writable){
    try {
      const currentFolderPath = __dirname;

      let extensionName = this.fileName.split('.').reverse()[0];
      
      // if(extensionName === 'gz') decompressionStream = zlib.createGunzip();
      // if(extensionName === 'br') decompressionStream = zlib.createDeflate();
      // if(extensionName === 'zz') decompressionStream = zlib.createBrotliDecompress();

      let decompresStream = new DecompressionStream('gzip');

      if(this.password){
        let decryptSymetricSplitted = new DecryptSymetricSplittedStream({key:this.password});
        await pipeline(readable, decryptSymetricSplitted, decompresStream, writable);
      } else {
        let gzipDecompression = zlib.createGunzip()
        await pipeline(readable, gzipDecompression, writable);
      }
      
    } catch (error) {
      console.log(error, 'Error catched in decompress');
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
    }
  }

  async decryptSymmetric(readable, writable){
    try {
      let decryptSymetricSplitted = new DecryptSymetricSplittedStream({key:this.password});

      await pipeline(readable, DecryptSymetricSplittedStream, writable).catch((error)=>{
        console.log(error, 'Error in decryptSymmetric pipeline');
        throw new Error(error);
      })

    } catch (error) {
      console.log(error, "Error catched in decryptSymmetric")
      return "Error during Symmetric decryption"
    }
  }
}

module.exports = TransformFile;