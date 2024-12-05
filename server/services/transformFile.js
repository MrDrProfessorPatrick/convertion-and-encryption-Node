const busboy = require('busboy');

const TransformFile = require('../TransformMethods/TransformFile');

async function transformFile(req, res, next) {

  // regarding req options call CompressionFactory or any other
  try {
    let fields = {};
    const bb = busboy({ headers: req.headers });

    bb.on('field', (name, val, info) => {
      fields[name] = val;
    });

    bb.on('file', (name, file, info) => {
      const { filename } = info;
      let extensionName = filename.split('.').reverse()[0];
      let compressionMethod = '';
      let encryptionMethod = '';
      let password = fields.password;
      let fileSize = req.headers['content-length'];
      let filePath = '';

      if(fields.deflate === 'true') compressionMethod = 'deflate';
      if(fields.brotli === 'true') compressionMethod = 'brotli';
      if(fields.symetricEncryption === 'true') encryptionMethod = 'symetric';
      if(fields.asymetricEncryption === 'true') encryptionMethod = 'asymetric';

    if(extensionName === 'txt' && !compressionMethod && !encryptionMethod){
      // TODO 
      req.unpipe(bb);
      return res.status(400).json('Choose the decompression method or file with extension like .br or .gz to decompress');
    }

      let transform = new TransformFile(
        compressionMethod,
        encryptionMethod,
        password,
        fileSize,
        filename,
        filePath
      );

    if(extensionName === 'br' || extensionName === 'gz'){
      let fileNameTxt = filename.replace(/\.\w+/, ".txt");

      res.setHeader(
        "Content-disposition",
        `attachment; filename="${fileNameTxt}"`
      );
      transform.decompress(file, res);
      return;
    }

    if(compressionMethod) {
      transform.compress(file, res);
      return
    }

    if(password) {
      transform.encryptSymmetric(file, res);
      return
    }
  })

  req.pipe(bb);
 
  } catch (error) {
      console.log(error, 'Error occured on file transformation');
      return res.status(400).json('Error occured on file transformation');
  }
}

module.exports = { transformFile };
