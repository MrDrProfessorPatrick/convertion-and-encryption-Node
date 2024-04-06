const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");
const fs = require("node:fs");
const { pipeline } = require("node:stream");
const encryptSymetricStream = require("./encryptSymetricStream");

function encryptSymetricService(textToEncrypt, key) {
  const keySalt = scryptSync(key, "salt", 24);
  const nonce = randomBytes(12);

  const cipher = createCipheriv("aes-192-ccm", keySalt, nonce, {
    authTagLength: 16,
  });

  let ciphertext = cipher.update(textToEncrypt, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const tag = cipher.getAuthTag();
  let nonceString = nonce.toString("base64");

  let tagString = tag.toString("base64");

  let responseCipher = nonceString + "-" + tagString + "-" + ciphertext;
  return { responseCipher };
}

function decryptSymetricService(cipher, key) {
  const keySalt = scryptSync(key, "salt", 24);

  let [nonce, tag, cipherText] = cipher.split("-");

  const decipher = createDecipheriv(
    "aes-192-ccm",
    keySalt,
    Buffer.from(nonce, "base64"),
    {
      authTagLength: 16,
    }
  );

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decryptedPlaintext = decipher.update(cipherText, "base64", "utf8");

  try {
    decipher.final("utf8");
    return decryptedPlaintext;
  } catch (err) {
    throw new Error("Authentication failed!", { cause: err });
  }
}

async function encryptSymetric(req, res, next) {
  console.log("req.body", req.body);
  console.log("req.file", req.file);

  if (!req.body) {
    return res.status(400).json("No text for encryption was received");
  }
  if (req.file) {
    let readableStream = fs.createReadStream(req.file);

    let writableEncryptionStream = fs.createWriteStream(
      `${__dirname}/../encrypted_files/encrypted${req.file.filename}`
    );
    let symcetricEncryptyon = new pipeline(
      readableStream,
      encryptSymetricStream,
      writableEncryptionStream,
      (error) => {
        if (error) {
          return res
            .status(400)
            .json("Error occred on file symetric encryption");
        } else {
          return res.status(200).json("Succesfully encrypted");
        }
      }
    );
  }

  let { password, text } = req.body;

  if (!password || !text) {
    return res.status(400).json("No text or password were provided");
  }

  let encryptedObj = encryptSymetricService(text, password);
  return res.status(200).json(encryptedObj);
}

async function decryptSymetric(req, res, next) {
  if (!req.body) {
    return res.status(400).json("No text for encryption was received");
  }
  let { password, text } = req.body;
  let decryptedText = decryptSymetricService(text, password);
  return res.status(200).json({ decryptedText });
}

module.exports = { encryptSymetric, decryptSymetric };
