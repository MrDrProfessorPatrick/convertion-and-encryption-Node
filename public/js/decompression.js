import {renderCompressionScale} from './renderScale.js';

const decompressionForm = document.getElementById("decompressionForm");
const fileDecompression = document.getElementById("inputFileDecompression");
const fileNameDecompression = document.getElementById("fileNameDecompression");
const decryptionPassword = document.getElementById('decryptionPassword');
const fileDecompress = document.getElementById("inputFileDecompression");
const reverseScale = document.getElementById('reverse-conversion-scale');

function changeFile(e) {
  fileNameDecompression.innerHTML = e.target.files[0].name;
}

async function decompressFile(e, scaleContainer) {
  try {
    e.preventDefault();
    const formData = new FormData();
    formData.append('operation', 'decompress');
    formData.append('password', decryptionPassword.value);
    formData.append('file', fileDecompress.files[0]);

    if(!fileDecompression.files[0]){
      return alert('Choose the file to decompress');
    }

    let currentFileExtension = fileDecompression.files[0].name.match(/\.\w+/)[0];
    var fileName;
    let originalFilelength = fileDecompression.files[0].size;
    let valueLoaded = 0;

    if (currentFileExtension !== 'txt') originalFilelength *= 2;

    fetch('/sendfile', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if(response.status >= 400) {
          let errorMessage = response.json();
          return new Promise((resolve, reject)=>{
            console.log('errorMess', errorMessage)
            reject(errorMessage);
          })
        }

        let fileNameHeader = response.headers.get('content-disposition');
        if(fileNameHeader && fileNameHeader.match(/"\w.+"/g)[0]){
          fileName = fileNameHeader.match(/"\w.+"/g)[0]
          fileName = fileName.substring(1, fileName.length-1)
        } else {
          fileName = 'decompressed/decryptedFile.txt';
        }
        return response.body;
      })
      .then((rb) => {
        const reader = rb.getReader();

        return new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              return reader.read().then(({ done, value }) => {
                // If there is no more data to read
                if (done) {
                renderCompressionScale(reverseScale, valueLoaded, valueLoaded, 'reverseId', 'reverseScale');
                  controller.close();
                  return value;
                }
                const decoder = new TextDecoder("utf8");
                let sizeObjDecoded = decoder.decode(value).trim();
                valueLoaded += value.byteLength;
                renderCompressionScale(reverseScale, originalFilelength, valueLoaded, 'reverseId', 'reverseScale');
                // Get the data and send it to the browser via the controller
                controller.enqueue(value);
                // Check chunks by logging to the console
                return push();
              });
            }
            return push();
          },
        });
      })
      .then((stream) => new Response(stream))
      .then((response) => response.blob())
      .then((blob) => {
        let fileUrl = URL.createObjectURL(blob);
        const fileLink = document.createElement("a");
        fileLink.href = fileUrl;
        fileLink.setAttribute("download", fileName); // change extension
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        URL.revokeObjectURL(fileUrl);
      })
      .catch((error) => {
        console.log('decompression catched error', error);
        error.then((errData)=>{
          alert(errData);
        })
      })
  } catch (error) {
      alert(error)
  }
}

fileDecompression.addEventListener("change", changeFile);
decompressionForm.addEventListener("submit", decompressFile);
