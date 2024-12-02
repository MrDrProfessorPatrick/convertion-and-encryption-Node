const fs = require("node:fs");
const busboy = require('busboy');

const TransformFile = require('../TransformMethods/TransformFile');
const uploadsPath = require('../../uploads/uploadsFolderPath');
const busboyWrapper = require("../helpers/busboyWrapper");

async function transformFile(req, res, next) {
  console.log('req.file', req.file)

  // if (!req.file) {
  //   return res.status(400).json("No File was received");
  // }
  // regarding req options call CompressionFactory or any other
  try {

    let fields = {};

    const bb = busboy({ headers: req.headers });

    bb.on('field', (name, val, info) => {
      fields[name] = val;
    });

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log('info', info)
      let compressionMethod = 'deflate';
      let encryptionMethod = false;
      let password = '';
      let fileSize = req.headers['content-length'];
      let filePath = ''
      let fileName = filename;

      let transform = new TransformFile(
        compressionMethod,
        encryptionMethod,
        password,
        fileSize,
        fileName,
        filePath
      );

      if(compressionMethod) {
        transform.compress(file, res)
    }
    })

    bb.on('close', () => {
      console.log('Done parsing form!');
      res.end();
    });

    req.pipe(bb);


    // let encryptionMethod = false;
    // const decryption = false;
    // const encryption = false;
    // let compressionMethod = 'deflate';

    // const fileSize = 1000;
    // const fileName = 'test_filename.txt';
    // const filePath = 'test_file_path';
    // const password = '';

//TODO change for different type of encryption;
    // if(req.body.symetricEncryption || req.body.asymetricEncryption) 
      // encryptionMethod = 'symetricEncryption';
    
    // if (req.body.deflate === "true") {
    //   compressionMethod = 'deflate'
    // };

    // if (req.body.brotli === "true") {
    //   compressionMethod = 'brotli'
    // };

    // let transform = new TransformFile(
    //   compressionMethod,
    //   encryptionMethod,
    //   password,
    //   fileSize,
    //   fileName,
    //   filePath
    // );

  // let extensionName = fileName.split('.').reverse()[0];

  // if(extensionName === 'txt' && decryption === 'false'){
  //   return res.status(400).json('Choose the decryption method or file with extension like .br or .gz to decompress');
  // }

  // if(extensionName === 'br' || extensionName === 'gz'){
  //   let fileNameTxt = fileName.replace(/\.\w+/, ".txt");

  //   let readableStreams = fs.createReadStream(
  //     `${uploadsPath}/${fileName}`,
  //     // { highWaterMark: 12432 }
  //   );

  //   res.setHeader(
  //     "Content-disposition",
  //     `attachment; filename="${fileNameTxt}"`
  //   );
  
  //   res.setHeader("Content-type", "multipart/form-data");

  //   transform.decompress(readableStreams, res).catch((error)=>console.log('Error catched transform.decompress', error));
  //   return
  // }

  // if(decryption === 'true') {
  //   // encrypted size is higher than highWaterMark limit in encrypton, that's why highWaterMark should be increased here
  //   let readableStream = fs.createReadStream(`${uploadsPath}/${fileName}`, { highWaterMark: 87424 });

  //   res.setHeader(
  //     "Content-disposition",
  //     `attachment; filename="${fileName}"`
  //   );
  
  //   res.setHeader("Content-type", "multipart/form-data");

  //   transform.decryptSymmetric(readableStream, res);
  //   return;
  // }

  // if(compressionMethod) {
  //   busboyWrapper(transform.compress, req, res);
  // }
    
  // if(password) {
  //   let encryptionResult = await transform.encryptSymmetric();
  //   return res.status(200).json(encryptionResult);
  // } 
        
  // return res.status(400).json('No options were chosen');
  
  } catch (error) {
      console.log(error, 'Error occured on file transformation');
      return res.status(400).json('Error occured on file transformation');
  }
}

module.exports = { transformFile };
