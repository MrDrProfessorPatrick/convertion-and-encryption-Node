const decompressionForm = document.getElementById("decompressionForm");
const fileDecompression = document.getElementById("inputFileDecompression");
const fileNameDecompression = document.getElementById("fileNameDecompression");
const decompressButton = document.getElementById("decompressionUpload");

const imageTypeCheckbox = document.getElementById("imageDecompress");
const textTypeCheckbox = document.getElementById("textDecompress");

function changeFile(e) {
  fileNameDecompression.innerHTML = e.target.files[0].name;
}

async function decompressFile(e) {\
  try {
    e.preventDefault();
    const form = e.currentTarget;
    const url = new URL(form.action);
  
    const fileExtensionToDownload = imageTypeCheckbox.checked ? "png" : "txt";
  
    const fetchOptions = {
      method: form.method,
      headers: { "Content-Type": "application/gzip" },
      body: fileDecompression.files[0],
    };
  
    console.log("fileDecompression.files[0]", fileDecompression.files[0].name);
  
    let currentFileExtension = fileDecompression.files[0].name.match(/\.\w+/);
  
    if(currentFileExtension !== '.gz' || currentFileExtension !== ".br" || currentFileExtension !== ".deflate"){
      throw new Error('We cannot decompress this file. File must have one of the following extensions as .gz, .br, .deflate')
    }
  
    // await fetch(url, fetchOptions)
    //   .then((response) => {
    //     console.log("response.body", response.body);
    //     return response.body;
    //   })
    //   .then((rb) => {
    //     const reader = rb.getReader();
  
    //     return new ReadableStream({
    //       start(controller) {
    //         // The following function handles each data chunk
    //         function push() {
    //           // "done" is a Boolean and value a "Uint8Array"
    //           return reader.read().then(({ done, value }) => {
    //             // If there is no more data to read
    //             if (done) {
    //               controller.close();
    //               return value;
    //             }
    //             // Get the data and send it to the browser via the controller
    //             controller.enqueue(value);
    //             // Check chunks by logging to the console
    //             return push();
    //           });
    //         }
  
    //         return push();
    //       },
    //     });
    //   })
    //   .then((stream) => new Response(stream))
    //   .then((response) => response.blob())
    //   .then((blob) => {
    //     let fileUrl = URL.createObjectURL(blob);
    //     const fileLink = document.createElement("a");
    //     fileLink.href = fileUrl;
  
    //     fileLink.setAttribute("download", `DECOMPRESSED_FILE.${fileExtension}`); // change extension
    //     document.body.appendChild(fileLink);
    //     fileLink.click();
    //     fileLink.remove();
    //   });
  } catch (error) {
    console.log(error);
  }

}

fileDecompression.addEventListener("change", changeFile);
decompressionForm.addEventListener("submit", decompressFile);
