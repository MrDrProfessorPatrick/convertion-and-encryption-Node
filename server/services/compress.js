const fs = require("node:fs");

const CompressionStream = require('../helpers/CompressionStream');
const GetBytesQuantity = require('../helpers/GetBytesQuantityStream');
const EncryptSymetricStream = require('../helpers/encryptSymetricStream');
const { pipeline } = require("node:stream/promises");

async function compress(req, res, next){
    if (!req.file) {
        return res.status(400).json("No File was received");
      }

    try {
        let encryptionMethod = false;

        const fileSize = req.file.size;
        const fileName = req.file.filename;
        const password = req.body.password;

        let compressionMethods = [];
    // TODO change for different type of encryption;
        if(req.body.symetricEncryption || req.body.asymetricEncryption) encryptionMethod = 'symetricEncryption';

        if (req.body.gzip === "true") {
            compressionMethods.push('gzip');
        };
        
        if (req.body.deflate === "true") {
            compressionMethods.push('deflate');
        };

        if (req.body.brotli === "true") {
            compressionMethods.push('brotli');
        };

        const pathToFile = __dirname;
  
        const compressionInfo = {
          originalSize: fileSize.toString(),
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
  
        const readableStream = fs.createReadStream(`${pathToFile}/../../uploads/${fileName}`)
  
        const symetricEncryptionStream = new EncryptSymetricStream({password, encryptionMethod});
          
        let startTime = Date.now();
        let fileNameZipped = fileName.replace(/\.\w+/, ".gz");
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
        console.log("error catched in compress", error);
    }
}

module.exports = compress;