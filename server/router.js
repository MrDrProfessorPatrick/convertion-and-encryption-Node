const Router = require("express");
var multer = require("multer");

const { compressFile } = require("./services/compressFile");

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

router.post("/sendfile", upload.single("file"), compressFile);

module.exports = router;
