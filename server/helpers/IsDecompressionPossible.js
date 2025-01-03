const { PassThrough } = require('node:stream');
const zlib = require('node:zlib');

function isDecompressionPossible(readable, decompressionMethod){

  let readableCopy = new PassThrough();
  let readableResult = new PassThrough();
  
  readable.pipe(readableCopy);
  readable.pipe(readableResult);

    return new Promise((resolve, reject) => {
      try {
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
              if(cnt > 0) {
                console.log('cnt', cnt)
                readableCopy.destroy();
                break;
              }
            console.log('chunk length', chunk.length)
          }
        });
        
        readableCopy.on('close', ()=>{
          console.log('CLOSE')
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