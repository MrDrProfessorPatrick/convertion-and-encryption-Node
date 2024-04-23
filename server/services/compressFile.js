const CompressionFactory = require('../FactoryMethods/compressionFactory');

async function compressFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json("No File was received");
  }
  // regarding req options call CompressionFactory or any other

  try {
    const disposition = 'attachment; filename="' + req.file.filename + '"';
    // res.set("Content-Encoding", "gzip");
    // res.setHeader("Content-Type", req.file.mimetype);
    // res.setHeader("Content-Disposition", disposition);
    const pathToFile = __dirname;

    let compressionMethods = [];

    const fileSize = req.file.size;
    const startTimeToCompress = Date.now();

    if (req.body.gzip === "true") compressionMethods.push("gzip");
    if (req.body.deflate === "true") compressionMethods.push("deflate");
    if (req.body.brotli === "true") compressionMethods.push("brotli");
   
  } catch (error) {
    console.log("error catched", error);
  }
}

module.exports = { compressFile };
