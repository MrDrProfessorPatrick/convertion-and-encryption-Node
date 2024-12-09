const express = require("express");
var bodyParser = require("body-parser");
const router = require("./router.js");
const PORT = 3000;

const app = express();

function errorHandler (err, req, res, next) {
    console.log('error in errorHandler', err)
    res.status(500).send('Something went wrong');
}

app.use(express.static("public"));
app.use(bodyParser.json());
app.use("/", router);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
