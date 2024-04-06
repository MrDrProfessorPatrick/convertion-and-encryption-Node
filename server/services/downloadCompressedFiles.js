const fs = require("node:fs");
const { pipeline } = require("readable-stream");

async function downloadCompressedFiles(req, res, next) {
  if (!req.body) {
    return res.status(400).json("No body were received");
  }

  let fileToDownload = req.body.fileName;

  async function downloadFiles(fileToDownload) {
    const pathToFile = __dirname;

    res.setHeader(
      "Content-disposition",
      `attachment; filename="${fileToDownload}"`
    );
    res.setHeader("Content-type", "multipart/form-data");

    let readableStreams = fs.createReadStream(
      `${pathToFile}/../compressed_files/${fileToDownload}`
    );

    pipeline(readableStreams, res, (error) => {
      if (error) {
        console.error("Error catched in Deflate", error);
      }
    });
  }

  downloadFiles(fileToDownload);
}

module.exports = { downloadCompressedFiles };
