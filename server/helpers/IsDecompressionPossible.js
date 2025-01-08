const { PassThrough } = require('node:stream');
const zlib = require('node:zlib');
const { pipeline } = require("node:stream/promises");
const DecryptSymetricSplittedStream = require("../helpers/DecryptSymetricSplittedStream");
const StreamAborter = require("../helpers/StreamAborter");


async function isDecompressionPossible(readable, decompressionMethod, password){

  let readableCopy = new PassThrough();
  let readableResult = new PassThrough();
  let writableCopy = new PassThrough();
  const ac = new AbortController();
  const signal = ac.signal;
  
  readable.pipe(readableCopy);
  readable.pipe(readableResult);

    return new Promise((resolve, reject) => {
      try {

        if(password){
          let streamAborter = new StreamAborter({ac});
          let decompressionStream = null;
          let decryptStream = new DecryptSymetricSplittedStream({key:password});
          
          if(true) decompressionStream = zlib.createInflate();

            pipeline(readableCopy, decryptStream, decompressionStream, streamAborter, writableCopy, {signal})
            .then(() => resolve(readableResult))
            .catch((error) => {
              console.log('Catched error ', error);
              if(error.name === 'AbortError') {
                // if AbortError it means that decryption and decompression works fine;
                resolve(readableResult);
                } else {
                  reject(error);
                }
            })
          return;
        }


        readableCopy.on('readable', () => {
          let cnt = 0;
          while (null !== (chunk = readableCopy.read())) {
           let decompressed = zlib.createInflate().write(chunk);
           console.log('decompressed', decompressed);
           if(!decompressed) {
            reject('DECOMPRESSION IMPOSSIBLE');
            readableCopy.destroy();
            break;
          };
              cnt++
              if(cnt > 2) {
                readableCopy.destroy();
                break;
              }
          }
        });
        
        readableCopy.on('close', ()=>{
          resolve(readableResult);
        })

        readableCopy.on('error', ()=>{
          console.log('ERROR');
          reject(false);
        })
      } catch (error) {
        console.log('Error catched in isDecompressionPossible', error);
        reject(false);
      }

    })



}

module.exports = isDecompressionPossible;