const fs = require("node:fs");
const { pipeline } = require("readable-stream");

function downloadCompressedFiles(req, res) {
  if (!req.body) {
    return res.status(400).json("No body were received");
  }

  const pathToFile = __dirname;
  const file = `${pathToFile}/../compressed_files/zlib_compressed_bigTxt.txt`;
  const readableStream = fs.createReadStream(
    `${pathToFile}/../compressed_files/zlib_compressed_bigTxt.txt`
  );

  res.setHeader(
    "Content-disposition",
    `attachment; filename="zlib_compressed_bigTxt.txt"`
  );

  res.setHeader("Content-type", "multipart/form-data");

  return pipeline(readableStream, res, (error) => {
    if (error) {
      console.log(error, "Error in pipeline");
    }
    console.log("Stream finished successfully");
  });
}

module.exports = { downloadCompressedFiles };
