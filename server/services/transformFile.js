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
    console.log('req.body', req.body)
    const decryption = req.body.decryption;
    const encryption = req.body.encryption;
    const decompression = req.body.decompression;
    const compressionMethods = [];

    const fileSize = req.file.size;
    const fileName = req.file.filename;
    const filePath = req.file.path;
    const password = req.body.password;

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

    res.setHeader(
      "Content-disposition",
      `attachment; filename="${fileNameTxt}"`
    );
  
    res.setHeader("Content-type", "multipart/form-data");

    transform.decompress(readableStreams, res).catch((error)=>console.log('Error catched transform.decompress', error));
    return
  }

  if(decryption) {
    // encrypted size is higher than highWaterMark limit in encrypton, that's why highWaterMark should be increased here
    let readableStream = fs.createReadStream(`${uploadsPath}/${fileName}`, { highWaterMark: 87424 });

    res.setHeader(
      "Content-disposition",
      `attachment; filename="${fileName}"`
    );
  
    res.setHeader("Content-type", "multipart/form-data");

    transform.decryptSymmetric(readableStream, res).catch((error)=>console.log('Error catched transform.decryption', error));
    return;
  }

  if(compressionMethods.length) {

    const compressionResult = await transform.compress();
    return res.status(200).json(compressionResult);
  }
    
  if(password) {
    let encryptionResult = await transform.encryptSymmetric();
    return res.status(200).json(encryptionResult);
  } 
        
  return res.status(200).json('No options were chosen');
  
  } catch (error) {
      console.log(error, 'Error occured on file transformation');
      return res.status(400).json('Error occured on file transformation');
  }
}

module.exports = { transformFile };
