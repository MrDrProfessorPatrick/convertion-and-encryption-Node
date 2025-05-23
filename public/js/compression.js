import {renderCompressionScale, renderInitialScale} from './renderScale.js';

const file = document.getElementById("inputFile");
const fileName = document.getElementById("fileName");
const submitInput = document.getElementById("inputSubmit");
const form = document.getElementById("send-file-form");
const downloadButton = document.getElementById("download-button");
const deflateCheckPoint = document.getElementById("deflate");
const brotliCheckPoint = document.getElementById("brotli");
const noEncryptionInput = document.getElementById("noEncryption");
const symetricEncryptionInput = document.getElementById("symetricEncryption");
const asymetricEncryptionInput = document.getElementById("asymetricEncryption");
const noDecryptionInput = document.getElementById("noDecryptionRadio");
const decryptionInput = document.getElementById("decryptionRadio");
const encryptionPassword = document.getElementById("passwordInput");
const submitCompression = document.getElementById("file-manager-button-submit");

let downloadedFileName = "";

function renderCompressedFileName(fileName) {
  const compressedFilesContainer = document.querySelector(".download-files");
  const isCompressedFileNameExists = document.getElementById(fileName);

  if (isCompressedFileNameExists) isCompressedFileNameExists.remove();

  const compressedFileName = document.createElement("div");
  compressedFileName.id = fileName;
  compressedFileName.innerHTML = fileName;
  compressedFilesContainer.append(compressedFileName);
}

const originalSizeContainer = document.body.querySelector(".original-size");

const zlibCompressionContainer = document.body.querySelector(
  ".zlib-scale-container"
);

const brotliCompressionContainer = document.body.querySelector(
  ".brotli-scale-container"
);

const deflateCompressionContainer = document.body.querySelector(
  ".deflate-scale-container"
);

submitCompression.addEventListener("click", submintFile);
file.addEventListener("change", changeFile);

downloadButton.addEventListener("click", downloadFiles);

function changeFile(e) {
  fileName.innerHTML = e.target.files[0].name;
}

async function downloadFiles(e) {
  e.preventDefault();
  let filesNameToDownload = [];

  let documentsNameContainers =
    document.querySelector(".download-files").children;

  for (let element of documentsNameContainers) {
    filesNameToDownload.push(element.id);
    await downloadFileRequest(element.id);
  }

  async function downloadFileRequest(downloadFileName) {
    await fetch("/downloadfiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ fileName: downloadFileName }),
    })
      .then((response) => {
        return response.body;
      })
      .then((rb) => {
        const reader = rb.getReader();

        return new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              return reader.read().then(({ done, value }) => {
                // If there is no more data to read
                if (done) {
                  controller.close();
                  return value;
                }
                // Get the data and send it to the browser via the controller
                controller.enqueue(value);
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

        fileLink.setAttribute("download", `${downloadFileName}`); // change extension
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        URL.revokeObjectURL();
      });
  }
}

function submintFile(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append("deflate", deflateCheckPoint.checked);
  formData.append("brotli", brotliCheckPoint.checked);
  formData.append('symetricEncryption', symetricEncryptionInput.checked);
  formData.append('asymetricEncryption', asymetricEncryptionInput.checked);
  formData.append('password', encryptionPassword.value)
  formData.append('file', file.files[0])

  if(!deflateCheckPoint.checked && !brotliCheckPoint.checked && !symetricEncryptionInput.checked && !asymetricEncryptionInput.checked){
    alert('Choose compression and decryption options');
    return
  }
  if(!file.files[0]){
    alert("Chose the file")
    return;
  }

  async function getFileSizes() {
    try {
      let collectedData = "";
      let response = await fetch('/sendfile', {
          method:"POST",
          body: formData,
        });
        
        if(response.status >= 400 && response.status <= 500){
          let errorMessage = await response.json();
          throw new Error(errorMessage);
        }

        const reader = response.body.getReader();

        return new ReadableStream({
          start(controller) {
            return pump();
    
            function pump() {
              return reader.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }

                const decoder = new TextDecoder("utf8");
                let sizeObjDecoded = decoder.decode(value).trim();
                let sizeObjArr = sizeObjDecoded.split('}');
                let sizeObj = JSON.parse(sizeObjArr[sizeObjArr.length - 2]+"}")
                
                renderInitialScale(originalSizeContainer, sizeObj);

                if (sizeObj.brotliCompressionSize) {
                  renderCompressionScale(
                    brotliCompressionContainer,
                    sizeObj.originalSize,
                    sizeObj.brotliCompressionSize,
                    "compressScaleBrotliId",
                    "compressSizeBrotliId"
                  );
                  renderCompressedFileName(sizeObj.brotliFileName);
                }

                if (sizeObj.deflateCompressionSize) {
                  renderCompressionScale(
                    deflateCompressionContainer,
                    sizeObj.originalSize,
                    sizeObj.deflateCompressionSize,
                    "compressScaleDeflateId",
                    "compressSizeDeflateId"
                  );
                  renderCompressedFileName(sizeObj.deflateFileName);
                }

                if(sizeObj.encryptedFileName){
                  renderCompressedFileName(sizeObj.encryptedFileName);
                }

                // Enqueue the next data chunk into our target stream
                controller.enqueue(sizeObj);
                return pump();
              });
            }
          },
        });

    } catch (error) {
      throw new Error(error);
    }
  }

  getFileSizes()
}
