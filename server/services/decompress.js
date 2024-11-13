const zlib = require('node:zlib'); 
const fs = require("node:fs");

const DecompressionStream = require('../helpers/DecompressionStream');
const { pipeline } = require("node:stream/promises");
const DecryptSymetricSplittedStream = require("../helpers/DecryptSymetricSplittedStream");
const uploadsPath = require('../../uploads/uploadsFolderPath');

async function decompress(req, res, next){
    if (!req.file) {
        return res.status(400).json("No File was received");
      }

      const fileName = req.file.originalname;
      const password = req.body.password;

    try {
        let decompressionStream = null;
  
        let extensionName = fileName.split('.').reverse()[0];
        
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
      }
}

module.exports = decompress;