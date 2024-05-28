const Router = require("express");
var multer = require("multer");

const { transformFile } = require("./services/transformFile");

const {
  encryptSymetric,
  decryptSymetric,
} = require("./services/symetricEncription");

const {
  downloadCompressedFiles,
} = require("./services/downloadCompressedFiles");

const router = new Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },

  filename: (req, file, cb) => {
    const { originalname } = file;
    // or
    // uuid, or fieldname
    cb(null, originalname);
  },
});

var upload = multer({ storage });

// const encryptionUpload = multer({ dest: "up" });

router.post("/sendfile", upload.single("file"), transformFile);
router.post("/downloadfiles", downloadCompressedFiles);
router.post("/encryptsymetric", upload.single("file"), encryptSymetric);
router.post("/decryptsymetric", decryptSymetric);

module.exports = router;
