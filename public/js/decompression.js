const decompressionForm = document.getElementById("decompressionForm");
const fileDecompression = document.getElementById("inputFileDecompression");
const fileNameDecompression = document.getElementById("fileNameDecompression");
const decompressButton = document.getElementById("decompressionUpload");
const noDecompression = document.getElementById("noDecompression");
const textDecompress = document.getElementById("textDecompress");
const imageDecompress = document.getElementById("imageDecompress");
const imageTypeCheckbox = document.getElementById("imageDecompress");
const textTypeCheckbox = document.getElementById("textDecompress");
const decryptionPassword = document.getElementById('decryptionPassword');


function changeFile(e) {
  fileNameDecompression.innerHTML = e.target.files[0].name;
}

async function decompressFile(e) {
  try {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let currentFileExtension = fileDecompression.files[0].name.match(/\.\w+/)[0];
    var fileName;

    fetch('/sendfile', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if(response.status>=400) {
          let errorMessage = response.json();
          return new Promise((resolve, reject)=>{
            reject(errorMessage);
          })
        }
        let fileNameHeader = response.headers.get('content-disposition');
        fileName = fileNameHeader ? fileNameHeader.match(/"\w.+"/g)[0] : 'decompressed/decryptedFile.txt'
        fileName = fileName.substring(1, fileName.length - 1)
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
                  controller.close();
                  return value;
                }
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
      })
      .catch((error)=>{
        error.then((errorMessage)=>{
          alert(errorMessage)
        })
      })
  } catch (error) {
      alert(error)
  }
}

fileDecompression.addEventListener("change", changeFile);
decompressionForm.addEventListener("submit", decompressFile);
