const fs = require("node:fs");

const TransformFile = require('../FactoryMethods/TransformFile');
const uploadsPath = require('../../uploads/uploadsFolderPath');

async function transformFile(req, res, next) {

  if (!req.file) {
    return res.status(400).json("No File was received");
  }
  // regarding req options call CompressionFactory or any other
  try {
    let encryptionMethod = false;

    const decryption = req.body.decryption;
    const encryption = req.body.encryption;
    const compression = req.body.compression;
    const decompression = req.body.decompression;

    const fileSize = req.file.size;
    const fileName = req.file.filename;
    const filePath = req.file.path;
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

    let transform = new TransformFile(
      compressionMethods,
      encryptionMethod,
      password,
      fileSize,
      fileName,
      filePath
    );

  if(decompression){

    let fileNameTxt = fileName.replace(/\.\w+/, ".txt");

    let readableStreams = fs.createReadStream(
      `${uploadsPath}/${fileName}`,
      // { highWaterMark: 12432 }
    );

    let writableStream = fs.createWriteStream(`${__dirname}/../../decompressed_files/${fileNameTxt}`);

    transform.decompress(readableStreams, writableStream);
    return res.status(200).json('DECOMPRESSED')
  }  

  if(decryption) {
    let transformResult = await transform.decryptSymmetric(res);
    return res.status(200).json(transformResult);
  }

  if(req.body.gzip === 'true' || req.body.deflate === 'true' || req.body.brotli === 'true') {
    let compressionResult = await transform.compress();
    return res.status(200).json(compressionResult);
  }
    
  if(password) {
    let encryptionResult = await transform.encryptSymmetric();
    return res.status(200).json(encryptionResult);
  } 
        
  return res.status(200).json('No options were chosen');
  
  } catch (error) {
      console.log(error, 'Error occured on decompression');
      return res.status(400).json('Error occured on decompression');
  }
}

module.exports = { transformFile };
