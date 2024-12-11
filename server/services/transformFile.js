const busboy = require('busboy');
const EventEmitter = require('events');

const TransformFile = require('../TransformMethods/TransformFile');

async function transformFile(req, res, next) {

  // regarding req options call CompressionFactory or any other
  try {
      let fields = {};
      const bb = busboy({ headers: req.headers });
      const errorEvent = new EventEmitter();
  
    function busboyErrorEventWrapper(){
      console.log('busboyErrorEventWrapper')
      return new Promise((resolve, reject) => {
        errorEvent.once('error', resolve);
      })
    }  

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
      
          if(extensionName === 'br' || extensionName === 'gz'){
            let fileNameTxt = filename.replace(/\.\w+/, ".txt");
      
            // res.setHeader(
            //   "Content-disposition",
            //   `attachment; filename="${fileNameTxt}"`
            // );
  
            transform.decompress(file, res).catch((error)=>{
              console.log('DECOMPRESS CATCH')
              req.unpipe(bb);
              // errorEvent.emit('error');
              bb.emit('close')

            });

            return res.status(400).json('Error after decompress')
            
          } else if(compressionMethod) {
            transform.compress(file, res);
          } else if(password){
            transform.encryptSymmetric(file, res);
          }
  
        } catch (error) {
          console.log('error catched on FILE READING')
          throw new Error(error);
        }
    })
  
    bb.on('close', () => {
      console.log('Done parsing form!');
      return res.status(500).send('DECOMPRESS ONCLOSE EVENT')
    });
  
    bb.on("finish", () => {
      console.log('ON FINISH EVENT')
      return res.status(500).send('DECOMPRESS FINISH EVENT')
    });
 

  
    req.pipe(bb);
    // let result = await busboyErrorEventWrapper();

    //  console.log('sync result', result)

    //  return res.status(500).json('ERROR OCCURED');
  } catch (error) {
    console.log('Error occured on file transformation', error);
    // return res.status(400).json('Error occured on file transformation');
  }
}

module.exports = { transformFile };
