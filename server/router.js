const Router = require("express");
var multer = require("multer");

const { transformFile } = require('./services/transformFile');

const {
  downloadFileRequest,
} = require("./services/downloadFileRequest");

const router = new Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },

//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, originalname);
//   },
// });

// var upload = multer({ storage });

router.post("/sendfile", transformFile);
router.post("/downloadfiles", downloadFileRequest);

module.exports = router;
