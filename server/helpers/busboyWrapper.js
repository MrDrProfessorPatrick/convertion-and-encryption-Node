const busboy = require('busboy');

function busboyWrapper(wrappedMethod, req, res) {
    const bb = busboy({ headers: req.headers });

    bb.on('field', (name, val, info) => {
      console.log(`Field [${name}]: value: %j`, val);
    });

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      let startTime = Date.now();
      let compressionStream;
      let fileNameZipped;
      wrappedMethod(file, req, res);
    })
    req.pipe(bb)
}

module.exports = busboyWrapper;