const EventEmitter = require('node:events');
const StreamAborter = require("./StreamAborter");

async function reverseConversion(readable, decompressionStream, decryptionStream, writable){

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
    let streamAborter = new StreamAborter(myEmitter);

    if(decompressionStream){
      if(decryptionStream) {
        return new Promise((resolve, reject) => {
          readable
            .on("error", (error) => {
              handlePipeError([readable, decryptionStream, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(decryptionStream)
            .on("error", (error) => {
              handlePipeError([readable, decryptionStream, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(decompressionStream)
            .on("error", (error) => {
              handlePipeError([readable, decryptionStream, decompressionStream, streamAborter]);
              reject(error);
            })
            .pipe(streamAborter)
            .on("error", (error) => {
              handlePipeError([readable, decryptionStream, decompressionStream, streamAborter]);
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
      readable
        .on("error", (error) => {
          handlePipeError([readable, decryptionStream, streamAborter]);
          reject(error);
        })
        .pipe(decryptionStream)
        .on("error", (error) => {
          handlePipeError([readable, decryptionStream, streamAborter]);
          reject(error);
        })
        .pipe(streamAborter)
        .on("error", (error) => {
          handlePipeError([readable, decryptionStream, streamAborter]);
          reject(error);
        })
    });
  }
 
  } catch (error) {
    reject(false);
  }
}

module.exports = reverseConversion;