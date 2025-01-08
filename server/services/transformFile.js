const busboy = require('busboy');
const EventEmitter = require('events');

const TransformFile = require('../TransformMethods/TransformFile');

async function transformFile(req, res, next) {

  // regarding req options call CompressionFactory or any other
  try {
    let fields = {};
    const bb = busboy({ headers: req.headers });
  
    function busboyWrapper(){

      return new Promise((resolve, reject) => {
        
        bb.on('field', (name, val, info) => {
          fields[name] = val;
        });
  
        bb.on('file', (name, file, info) => {
          try {
            const { filename } = info;
            let extensionName = filename.split('.').reverse()[0];
            let compressionMethod = '';
            let encryptionMethod = '';
            let password = fields.password;
            let fileSize = req.headers['content-length'];
            let filePath = '';
      
            if(fields.deflate === 'true') compressionMethod = 'deflate';
            if(fields.brotli === 'true') compressionMethod = 'brotli';
            if(fields.symetricEncryption === 'true') encryptionMethod = 'symetric';
            if(fields.asymetricEncryption === 'true') encryptionMethod = 'asymetric';
      
            if(extensionName === 'txt' && !compressionMethod && !encryptionMethod){
              // TODO 
              req.unpipe(bb);
              // return res.status(400).json('Choose the decompression method or file with extension like .br or .gz to decompress');
            }
        
              let transform = new TransformFile(
                compressionMethod,
                encryptionMethod,
                password,
                fileSize,
                filename,
                filePath
              );
        
            if(extensionName === 'br' || extensionName === 'gz') {
              let fileNameTxt = filename.replace(/\.\w+/, ".txt");
        
              res.setHeader(
                "Content-disposition",
                `attachment; filename="${fileNameTxt}"`
              );
    
              transform.decompress(file, res).catch((error) => {
                req.unpipe(bb);
                bb.emit('close', error)
              });

            } else if(compressionMethod) {
              transform.compress(file, res);
            } else if(password){
              transform.encryptSymmetric(file, res);
            }
    
          } catch (error) {
            throw new Error(error);
          }
      })
  
        bb.on('close', (error) => {
          console.log('bb.close', error)
          if(error) {
            reject(error);
          }
        });
      
        bb.on("finish", () => {
          resolve('Operation finished')
        });
 
      req.pipe(bb);

      })
    }  

     let result = await busboyWrapper();
     if(res.headersSent) return;
     return res.status(200).json(result.toString());

  } catch (error) {
    console.log('Error occured on file transformation', error);
    return res.status(500).json(error.toString());
  }
}

module.exports = { transformFile };
