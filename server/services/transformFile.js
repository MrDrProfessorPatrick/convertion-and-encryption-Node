const TransformFile = require('../FactoryMethods/TransformFile');

async function transformFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json("No File was received");
  }
  // regarding req options call CompressionFactory or any other
  try {
    let encryptionMethod = false;

    console.log('BODY ', req.body)

    const fileSize = req.file.size;
    const fileName = req.file.filename;
    const filePath = req.file.path;
    const password = req.body.encryptionPassword;

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

    let compression = new TransformFile(
      compressionMethods,
      encryptionMethod,
      password,
      fileSize,
      fileName,
      filePath
    );

    if(req.body.gzip === 'true'  || req.body.deflate === 'true' || req.body.brotli === 'true'){
      let compressionResult = await compression.compress();
      
      return res.status(200).json(compressionResult);
    } else if(password) {
      let encryptionResult = await compression.encryptSymmetric();

      return res.status(200).json(encryptionResult);
    } else {
      return res.status(200).json('No options were chosen');
    }
  } catch (error) {
    return res.status(400).json('Error occured on encryption')
  }
}

module.exports = { transformFile };
