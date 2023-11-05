const express = require("express");
var bodyParser = require("body-parser");
const router = require("./router.js");

const PORT = 3000;

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

app.use("/", router);

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
