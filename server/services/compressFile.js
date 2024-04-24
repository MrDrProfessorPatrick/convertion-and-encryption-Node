const Compression = require('../FactoryMethods/compressionFactory');

async function compressFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json("No File was received");
  }
  // regarding req options call CompressionFactory or any other

  try {
    let compression;
    let encryptionMethod = false;

    console.log('BODY ', req.body)

    const fileSize = req.file.size;
    const fileName = req.file.filename;
    const startTimeToCompress = Date.now();

    if(req.body.symetricEncryption || req.body.asymetricEncryption) encryptionMethod = 'symetricEncryption';

    if (req.body.gzip === "true") {
      compression = new Compression('gzip', encryptionMethod, fileSize, fileName);
    };
    
    if (req.body.deflate === "true") {
      compression = new Compression('deflate', encryptionMethod, fileSize, fileName);
    };

    if (req.body.brotli === "true") {
      compression = new Compression('brotli', encryptionMethod, fileSize, fileName);
    };
    console.log('compression class', compression);
    let compressionResult = compression.compress();

    return res.status(200).json(compressionResult);
   
  } catch (error) {
    console.log("error catched", error);
  }
}

module.exports = { compressFile };
