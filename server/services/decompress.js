const zlib = require('node:zlib'); 
const fs = require("node:fs");
const busboy = require('busboy');

const DecompressionStream = require('../helpers/DecompressionStream');
const { pipeline } = require("node:stream/promises");
const DecryptSymetricSplittedStream = require("../helpers/DecryptSymetricSplittedStream");
const uploadsPath = require('../../uploads/uploadsFolderPath');

async function decompress(req, res, next){
  const bb = busboy({ headers: req.headers });
  let formData = new Map();
  let externalFile = null
    // if (!req.file) {
    //     return res.status(400).json("No File was received");
    //   }

      // const fileName = req.file.originalname;
      const password = req.body.password;
      console.log('password', password)
    try {
        // let readableStreams = fs.createReadStream(
        //     `${uploadsPath}/${fileName}`,
        //     // { highWaterMark: 12432 }
        //   );
        // await pipeline(req, decryptSymetricSplitted, decompresStream, res);
        bb.on('field', (name, val, info) => {
          console.log('fiels added')
          formData.set(name, val);
        })

        
        bb.on('file', (name, file, info) => {

          let decompressionStream = null;
          if(!externalFile) externalFile = file;

          const {filename} = info;
          let extensionName = filename.split('.').reverse()[0];
          console.log('formData', formData)
          console.log('info', info)
          if(extensionName === 'gz') decompressionStream = zlib.createGunzip();
          if(extensionName === 'br') decompressionStream = zlib.createDeflate();
          if(extensionName === 'zz') decompressionStream = zlib.createBrotliDecompress();
    
          let decompresStream = new DecompressionStream('gzip');
          let decryptSymetricSplitted = new DecryptSymetricSplittedStream({key:password});
          
          if(!decompressionStream) return;

        let readableStreams = fs.createReadStream(
            `${uploadsPath}/${fileName}`,
            // { highWaterMark: 12432 }
          );


        await pipeline(readableStreams, decryptSymetricSplitted, decompresStream, res);
      } catch (error) {
        console.log(error, 'Error catched in decompress');
        res.writeHead(404);
        res.end();
      }
}

module.exports = decompress;