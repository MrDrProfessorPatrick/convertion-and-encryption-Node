const fs = require("node:fs");
const zlib = require('node:zlib'); 

const CompressionStream = require('../helpers/CompressionStream');
const DecompressionStream = require('../helpers/DecompressionStream');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');
const DecryptSymetricStream = require("../helpers/decryptSymetricStream");
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

        const readableStream = fs.createReadStream(`${pathToFile}/../../uploads/${this.fileName}`)

        const symetricEncryptionStream = new EncryptSymetricStream({password: this.password, encryptionMethod: this.encryptionMethod});
          
        async function pipelineCompressor(){
          try {
            let startTime = Date.now();
            let fileNameZipped = innerThis.fileName.replace(/\.\w+/, ".gz");
            let getStreamData = new GetBytesQuantity({compressionMethod:'gzip', compressionInfo, startTime, fileNameZipped:fileNameZipped});
            let compressionStream = new CompressionStream('gzip');

            if(!fs.existsSync(`${__dirname}/../../modified_files`)){
              fs.mkdirSync(`${__dirname}/../../modified_files`)
            }
            
            let writableStream = fs.createWriteStream(
              `${pathToFile}/../../modified_files/${fileNameZipped}`
            );

            await pipeline(
              readableStream,
              compressionStream,
              symetricEncryptionStream,
              getStreamData,
              writableStream
            ).catch((error)=>console.log(error, 'Error in gzip pipeline'));     

          return compressionInfo;

          } catch (error) {
            console.log(error, 'Error catched in pipelineCompressor')
        }
      }

      let compressionInfoResult = await pipelineCompressor();
      return compressionInfoResult;
        
    } catch (error) {
      console.log("error catched", error);
    }
  }

  async decompress(readable, writable){
    try {
      const currentFolderPath = __dirname;
      let decompressionStream = null;

      let extensionName = this.fileName.split('.').reverse()[0];
      
      if(extensionName === 'gz') decompressionStream = zlib.createGunzip();
      if(extensionName === 'br') decompressionStream = zlib.createDeflate();
      if(extensionName === 'zz') decompressionStream = zlib.createBrotliDecompress();

      let decompresStream = new DecompressionStream('gzip');
      // let decryptSymetric = new DecryptSymetricStream({key:this.password});
      let decryptSymetricSplitted = new DecryptSymetricSplittedStream({key:this.password});
      
      if(!decompressionStream) return;

      pipeline(readable, decryptSymetricSplitted, decompresStream, writable).then((result)=>console.log('decompression pipeline result', result))
      .catch((error)=>console.log(error, 'Error in decompress pipeline'));

    } catch (error) {
      console.log(error, 'Error catched in decompress');
    }
  }

  async encryptSymmetric(){
    try {
      let readableStream = fs.createReadStream(this.filePath);
      let encryptSymetric = new EncryptSymetricStream({password:this.password});
      let writableEncryptionStream = fs.createWriteStream(
        `${__dirname}/../../modified_files/${this.fileName}`
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

  async decryptSymmetric(writableStream){
    try {
      console.log('this.password decryptSymmetric',  this.password)
      // encrypted size is higher than highWaterMark limit in encrypton, that's why highWaterMark should be increased here
      let readableStream = fs.createReadStream(`${uploadsPath}/${this.fileName}`, { highWaterMark: 87424 });
      let decryptSymetric = new DecryptSymetricStream({key:this.password});
      let writableDecryptionStream = fs.createWriteStream(`${__dirname}/../../decrypted_files/${this.fileName}`);
      
      await pipeline(readableStream, decryptSymetric, writableDecryptionStream).catch((error)=>{
        console.log(error, 'Error in decryptSymmetric pipeline');
        return 'Error in pipeline';
      })

      return "Succesfully decrypted";
    } catch (error) {
      console.log(error, "Error catched in decryptSymmetric")
      return "Error during Symmetric decryption"
    }
  }
}

module.exports = TransformFile;