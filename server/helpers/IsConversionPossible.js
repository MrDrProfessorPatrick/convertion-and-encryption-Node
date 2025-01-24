const { PassThrough } = require('node:stream');
const zlib = require('node:zlib');
const { pipeline } = require("node:stream/promises");
const DecryptSymetricSplittedStream = require("./DecryptSymetricSplittedStream");
const StreamAborter = require("./StreamAborter");


async function isConversionPossible(readable, decompressionMethod, password){

  new PassThrough();
  
 let readableCopy = readable.pipe(new PassThrough());
//  let readableResult = readable.pipe(new PassThrough());

  try {
    let decompressionStream = null;
    let streamAborter = new StreamAborter("STREAM ABORTER");
    let decryptStream = new DecryptSymetricSplittedStream({key:password});

    if(true) decompressionStream = zlib.createInflate();
    console.log('decompressionMethod in isConversionPossible', decompressionMethod)

  return new Promise((resolve, reject) => {
    pipeline(readableCopy, decryptStream, streamAborter)
    .then(() => {
      console.log('reqdable result resolved')
      resolve(readableResult);

    })
    .catch((error) => {
      if(error === 'AbortError') {
        // if AbortError it means that decryption and decompression works fine;
        console.log('resolve AbortError')
        // resolve(readableResult);
  
        } else {
          console.log('error in conversion possible', error)
          reject(error);
        }
    })
   })  


    // if(!decompressionMethod) {
    //   console.log('no decompression method if');
    //   return new Promise((resolve, reject) => {
    //     console.log('password', password)
    //     if(!password){
    //       console.log('no password if')
    //         pipeline(readableCopy, decompressionStream, streamAborter)
    //         .then(() => resolve(readableResult))
    //         .catch((error) => {
    //           if(error === 'AbortError') {
    //             // if AbortError it means that decryption and decompression works fine;
    //             resolve(readableResult);
    //             } else {
    //               reject(error);
    //             }
    //         })
    //     } else {
    //         console.log('password else')  
    //         pipeline(readable, decryptStream, streamAborter)
    //         .then(() => {
    //           console.log('reqdable result resolved')
    //           resolve(readableResult);
    //         })
    //         .catch((error) => {
    //           if(error === 'AbortError') {
    //             // if AbortError it means that decryption and decompression works fine;
    //             console.log('resolve AbortError')
    //             resolve(readableResult);
          
    //             } else {
    //               console.log('error in conversion possible', error)
    //               reject(error);
    //               readable.unpipe(readableResult);

    //             }
    //         })
    //     }
    //   })  
    // }

    // if(password) {
    //   console.log('password if')
    //   return new Promise((resolve, reject) => {
    //     pipeline(readableCopy, decryptStream, decompressionStream, streamAborter)
    //     .then(() => {
    //       console.log('reqdable result resolved')
    //       resolve(readableResult)})
    //     .catch((error) => {
    //       console.log('error IsConversionPossible', error)
    //       if(error === 'AbortError') {
    //         // if AbortError it means that decryption and decompression works fine;
    //         console.log('AbortError')
    //         resolve(readableResult);

    //         } else {
    //           reject(error);
    //         }
    //     })
    //   })  

    // } else {
    //   reject("Password needed");
    // }
  } catch (error) {
    reject(false);
  }
}

module.exports = isConversionPossible;