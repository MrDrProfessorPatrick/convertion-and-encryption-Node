const fs = require("node:fs");
const downloadFile = require('../helpers/downloadFile');

async function downloadFileRequest(req, res, next) {
  if (!req.body) {
    return res.status(400).json("No body were received");
  }

  if(!req.body.fileName) return res.status(400).json('No file name was mentioned');
  let fileToDownload = req.body.fileName;

  let readableStream = fs.createReadStream(
    `${__dirname}/../../modified_files/${fileToDownload}`
  );

  res.setHeader(
    "Content-disposition",
    `attachment; filename="${fileToDownload}"`
  );

  res.setHeader("Content-type", "multipart/form-data");

  return downloadFile(readableStream, res);
}


module.exports = { downloadFileRequest };
