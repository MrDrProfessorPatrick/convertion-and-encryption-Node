const { Transform } = require("readable-stream");
const decryptSymetricService = require("./decryptServices");

class DecryptSymetricSplittedStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options.key;
    this.current = null;
    this.iv = null;
    this.chunksToPush = [];
    this.decryptedArr = [];
    this.encryptionMethod = options.encryptionMethod;
  }
  
  _transform(chunk, encoding, done) {
    let self = this;
    
    try {
      if(this.key){
        function chunkHandler(chunk){
          if(chunk.length === 0) return; 

          function findChunkByDelimiter(chunk){

            let delimPos = chunk.indexOf("5b7c5d", 0, 'hex');
            console.log(chunk.length,'delimPos=', delimPos)

            if(delimPos === -1){
              if(self.current){
                self.current = Buffer.concat([self.current, chunk])
              } else {
                self.current = chunk;
              }
              return;
            }

            if(delimPos === 0){
              let nextChunk = chunk.subarray(3) // sadfsadfsdf|safsaf
              if(self.current){
                self.chunksToPush.push(self.current);
                self.current = null;
                return findChunkByDelimiter(nextChunk);
              } else {
                return findChunkByDelimiter(nextChunk);
              }
            }
      
            if(delimPos > 0 && delimPos < chunk.length-3){
              let prevChunk = chunk.subarray(0, delimPos);
              let nextChunk = chunk.subarray(delimPos+3) //doesn't include DELIMITER

              if(self.current){
                let fullChunk = Buffer.concat([self.current, prevChunk]);
                self.chunksToPush.push(fullChunk);
                self.current = null;
              } else {
                self.chunksToPush.push(prevChunk);
              }
              return findChunkByDelimiter(nextChunk)
            }
      
            if(delimPos === chunk.length-3){
              let nextChunk = chunk.subarray(0, chunk.length-3);

              if(self.current){
                self.chunksToPush.push(Buffer.concat([self.current, nextChunk]))
                self.current = null;
              } else {
                self.chunksToPush.push(nextChunk)
              }
              return
            }
          }
          findChunkByDelimiter(chunk)
        }
        
        chunkHandler(chunk)

       if(this.chunksToPush.length){
        if(this.iv === null) {
          this.iv = this.chunksToPush[0];
          this.chunksToPush = this.chunksToPush.slice(1);
        }
        this.chunksToPush.forEach((chunk)=>{
          console.log('DELIMITER', chunk.length, chunk.indexOf("5b7c5d", 0, 'hex'));

          let { decrypted } =  decryptSymetricService(chunk, this.key, this.iv)
          this.decryptedArr.push(decrypted);
        })
       }
        this.push(Buffer.concat(this.decryptedArr));
        done();
      } else {
        throw new Error('No key for decryption')
      }
    } catch (error) {
        console.log(error, 'Error catch in DecryptSymetricStream')
    }
  }

    _flush(cb){
      if(this.current){
      try {
        let { decrypted } =  decryptSymetricService(this.current, this.key, this.iv)
        this.push(decrypted);
      } catch (error) {
        throw new Error(error)
      }

      }
      cb()
    }
}

module.exports = DecryptSymetricSplittedStream;