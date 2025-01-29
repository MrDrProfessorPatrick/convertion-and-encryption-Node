const EventEmitter = require('node:events');
const zlib = require('node:zlib');
const DecryptSymetricSplittedStream = require("./DecryptSymetricSplittedStream");
const StreamAborter = require("./StreamAborter");


async function reverseConversion(readable, decompressionMethod, password, writable){

function handlePipeError(streams) {
  streams.forEach((stream) => {
    stream.destroy();
  })
}  

class MyEmitter extends EventEmitter {};

const myEmitter = new MyEmitter();

myEmitter.on('custom', (resumeStream) => {
  resumeStream
    .on("error", (error) => {
      handlePipeError([resumeStream, writable]);
      reject(error);
    })
    .pipe(writable)
    .on("error", (error) => {
      handlePipeError([resumeStream, writable]);
      reject(error);
    })
  })

  try {
    let decompressionStream = null;
    let streamAborter = new StreamAborter(myEmitter);
    let decryptStream = new DecryptSymetricSplittedStream({key:password});

    if(true) decompressionStream = zlib.createInflate();

    if(decompressionMethod){
      if(password) {
        return new Promise((resolve, reject) => {
          readable
            .on("error", (error) => {
              handlePipeError([readable, decryptStream, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(decryptStream)
            .on("error", (error) => {
              handlePipeError([readable, decryptStream, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(decompressionStream)
            .on("error", (error) => {
              handlePipeError([readable, decryptStream, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(streamAborter)
            .on("error", (error) => {
              handlePipeError([readable, decryptStream, decompressionStream, streamAborter]);
              reject(error);
            })
        });
      } else {
        return new Promise((resolve, reject) => {
          readable
            .on("error", (error) => {
              handlePipeError([readable, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(decompressionStream)
            .on("error", (error) => {
              handlePipeError([readable, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(streamAborter)
            .on("error", (error) => {
              handlePipeError([readable, decompressionStream, streamAborter]);
              reject(error);
            })
        });
      }
  } else {
    return new Promise((resolve, reject) => {
      if(!password) reject("Password is required");
      readable
        .on("error", (error) => {
          handlePipeError([readable, decryptStream, streamAborter]);
          reject(error);
        })
        .pipe(decryptStream)
        .on("error", (error) => {
          handlePipeError([readable, decryptStream, streamAborter]);
          reject(error);
        })
        .pipe(streamAborter)
        .on("error", (error) => {
          handlePipeError([readable, decryptStream, streamAborter]);
          reject(error);
        })
    });
  }
 
  } catch (error) {
    reject(false);
  }
}

module.exports = reverseConversion;