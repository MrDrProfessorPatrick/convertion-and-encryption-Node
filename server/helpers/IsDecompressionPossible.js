const { PassThrough } = require('node:stream');
const zlib = require('node:zlib');
const { pipeline } = require("node:stream/promises");
const DecryptSymetricSplittedStream = require("../helpers/DecryptSymetricSplittedStream");
const StreamAborter = require("../helpers/StreamAborter");


async function isDecompressionPossible(readable, decompressionMethod, password){

  let readableCopy = new PassThrough();
  let readableResult = new PassThrough();
  const ac = new AbortController();
  const signal = ac.signal;
  
  readable.pipe(readableCopy);
  readable.pipe(readableResult);

    return new Promise((resolve, reject) => {
      try {
        let decompressionStream = null;

        if(true) decompressionStream = zlib.createInflate();
        let streamAborter = new StreamAborter({ac});

        if(password){
          let decryptStream = new DecryptSymetricSplittedStream({key:password});
          

            pipeline(readableCopy, decryptStream, decompressionStream, streamAborter, {signal})
            .then(() => resolve(readableResult))
            .catch((error) => {
              if(error.name === 'AbortError') {
                // if AbortError it means that decryption and decompression works fine;
                resolve(readableResult);
                } else {
                  reject(error);
                }
            })
        } else {
          pipeline(readableCopy, decompressionStream, streamAborter, {signal})
          .then(() => resolve(readableResult))
          .catch((error) => {
            if(error.name === 'AbortError') {
              // if AbortError it means that decryption and decompression works fine;
              resolve(readableResult);
              } else {
                reject(error);
              }
          })
        }
      } catch (error) {
        reject(false);
      }
    })



}

module.exports = isDecompressionPossible;