const { text } = require("express");
const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} = require("node:crypto");

function encryptSymetricService(textToEncrypt, key) {
  const buf = Buffer.from("hello world", "utf8");

  const keySalt = scryptSync(key, "salt", 24);
  const nonce = randomBytes(12);
  // const aad = Buffer.from("0123456789", "hex");
  const cipher = createCipheriv("aes-192-ccm", keySalt, nonce, {
    authTagLength: 16,
  });
  // cipher.setAAD(aad, {
  //   plaintextLength: Buffer.byteLength(textToEncrypt),
  // });
  let ciphertext = cipher.update(textToEncrypt, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const tag = cipher.getAuthTag();
  let nonceString = nonce.toString("hex");
  // let aadString = aad.toString("hex");
  let tagString = tag.toString("base64");

  let responseCipher = nonce + "/" + tag + "/" + ciphertext;
  console.log("responseCipher", responseCipher);
  return { responseCipher };
}

function decryptSymetricService(cipher, key, nonce, tag) {
  const keySalt = scryptSync(key, "salt", 24);

  const decipher = createDecipheriv(
    "aes-192-ccm",
    keySalt,
    Buffer.from(nonce, "hex"),
    {
      authTagLength: 16,
    }
  );

  // decipher.setAAD(Buffer.from(aad, "hex"), {
  //   plaintextLength: Buffer.byteLength(cipher),
  // });

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decryptedPlaintext = decipher.update(cipher, "base64", "utf8");

  try {
    decipher.final("utf8");
    return decryptedPlaintext;
  } catch (err) {
    throw new Error("Authentication failed!", { cause: err });
  }
}

async function encryptSymetric(req, res, next) {
  if (!req.body) {
    return res.status(400).json("No text for encryption was received");
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
  let { password, text, nonce, aad, tag } = req.body;
  let decryptedText = decryptSymetricService(text, password, nonce, tag);
  return res.status(200).json({ decryptedText });
}

module.exports = { encryptSymetric, decryptSymetric };
