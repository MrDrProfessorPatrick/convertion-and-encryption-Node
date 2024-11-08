const { pipeline } = require("readable-stream");

// TODO need to add res as writable stream to args
async function downloadFile(readable, writable) {

  pipeline(readable, writable, (error) => {
    if (error) {
      console.error("Error catched in Deflate", error);
    }
  });
}

module.exports = downloadFile;