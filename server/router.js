const Router = require("express");
var multer = require("multer");

const compress = require('./services/compress');
const decompress = require('./services/decompress');

const {
  encryptSymetric,
  decryptSymetric,
} = require("./services/symetricEncription");

const {
  downloadFileRequest,
} = require("./services/downloadFileRequest");

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

var upload = multer({ storage:storage });

// const encryptionUpload = multer({ dest: "up" });

// router.post("/sendfile", upload.single("file"), transformFile);
router.post('/compress', upload.single("file"), compress);
router.post('/decompress', upload.single("file"), decompress);
router.post("/encryptsymetric", upload.single("file"), encryptSymetric);
router.post("/decryptsymetric", decryptSymetric);
router.post("/downloadfiles", downloadFileRequest);

module.exports = router;
