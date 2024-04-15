const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");
const fs = require("node:fs");
const { pipeline } = require("node:stream");
const EncryptSymetricStream = require("./encryptSymetricStream");

async function encryptSymetric(req, res, next) {
  // if (!req.body) {
  //   return res.status(400).json("No text for encryption was received");
  // }

  let { encryptionPassword, text } = req.body;

  if (req.file) {
    console.log("password in encryptSymetric request", encryptionPassword);
    let readableStream = fs.createReadStream(req.file.path);
    let encryptSymetric = new EncryptSymetricStream(encryptionPassword);
    let writableEncryptionStream = fs.createWriteStream(
      `${__dirname}/../encrypted_files/encrypted${req.file.filename}`
    );

    pipeline(
      readableStream,
      encryptSymetric,
      writableEncryptionStream,
      (error) => {
        if (error) {
          console.log("error in pipeline symetricEncription", error);
          return res
            .status(400)
            .json("Error occured on file symetric encryption");
        } else {
          return res.status(200).json("Succesfully encrypted");
        }
      }
    );
  }

  // if (!password || !text) {
  //   return res.status(400).json("No text or password were provided");
  // }

  // let encryptedObj = encryptSymetricService(text, password);
  // return res.status(200).json(encryptedObj);
}

async function decryptSymetric(req, res, next) {
  if (!req.body) {
    return res.status(400).json("No text for encryption was received");
  }

  if (req.file) {
    // DO DECRYPTION WITH PIPELINE
  }

  let { password, text } = req.body;
  let decryptedText = decryptSymetricService(text, password);
  return res.status(200).json({ decryptedText });
}

module.exports = { encryptSymetric, decryptSymetric };
