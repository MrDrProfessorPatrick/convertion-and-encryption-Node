const busboy = require('busboy');

function busboyWrapper(wrappedMethod) {
    const bb = busboy({ headers: req.headers });

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      let startTime = Date.now();
      let compressionStream;
      let fileNameZipped;
      wrappedMethod();
    })
    req.pipe(bb)
}

module.exports = busboyWrapper;