const Compression = require('../FactoryMethods/compressionFactory');

async function compressFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json("No File was received");
  }
  // regarding req options call CompressionFactory or any other
  try {
    let encryptionMethod = false;

    console.log('BODY ', req.body)

    const fileSize = req.file.size;
    const fileName = req.file.filename;
    const password = req.body.encryptionPassword;
    let compressionMethods = [];

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

    let compression = new Compression(
      compressionMethods,
      encryptionMethod,
      password,
      fileSize,
      fileName
    );
    
    let compressionResult = await compression.compress();

    return res.status(200).json(compressionResult);

  } catch (error) {
    console.log("error catched", error);
  }
}

module.exports = { compressFile };
