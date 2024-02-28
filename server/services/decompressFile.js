const fs = require("node:fs");
const zlib = require("zlib");
const { Readable, Writable, Transform, pipeline } = require("readable-stream");

async function decompressFile(req, res, next) {
  //   if (!req.file) {
  //     return res.status(400).json("No File was received");
  //   }

  const gzipDecompressStream = zlib.createGunzip();

  pipeline(req, gzipDecompressStream, res, (error) => {
    if (error) console.log("Error in pipeline", error);
    console.log("Decompression pipeline finished");
  });
}

module.exports = { decompressFile };
