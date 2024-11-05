const { Transform } = require("readable-stream");
const decryptSymetricService = require("./decryptServices");

class DecryptSymetricSplittedStream extends Transform {
  constructor(options) {
    super(options);
    this.key = options.key;
    this.current = null;
    this.iv = null;
    this.chunksToPush = [];
    this.decryptedArr = []
    this.chunkNumber = 0;
    this.encryptionMethod = options.encryptionMethod;
  }
  
  _transform(chunk, encoding, done) {
    let self = this;
    console.log('transform chunk length', chunk.length)
      try {
        if(!this.key) throw new Error('No key provided')  

        function chunkHandler(chunk){
          if(chunk.length === 0) return; 

          function findChunkByDelimiter(chunk){

            let delimPos = chunk.indexOf("|");

            if(delimPos === -1){
              if(self.current){
                self.current = Buffer.concat([self.current, chunk])
              } else {
                self.current = chunk;
              }
              console.log('delimPos = -1', chunk.toString())
              // done()
              return;
            }

            if(delimPos === 0){
              let nextChunk = chunk.subarray(1) // sadfsadfsdf|safsaf
              if(self.current){
                self.chunksToPush.push(self.current);
                console.log('chunk delim = 0', self.current.length)
                self.current = null;
                return findChunkByDelimiter(nextChunk);
              } else {
                return findChunkByDelimiter(nextChunk);
              }
            }
      
            if(delimPos > 0 && delimPos < chunk.length-1){
              let prevChunk = chunk.subarray(0, delimPos);
              let nextChunk = chunk.subarray(delimPos+1) //doesn't include |
              console.log('prevChunk=', prevChunk.length, 'nextChunk=', nextChunk.length)
              if(self.current){
                let fullChunk = Buffer.concat([self.current, prevChunk]);
                self.chunksToPush.push(fullChunk);
                console.log('fullChunk.length', fullChunk.length)
                self.current = null;
              } else {
                self.chunksToPush.push(prevChunk);
                console.log('prevChunk.length', prevChunk.length)
              }
              return findChunkByDelimiter(nextChunk)
            }
      
            if(delimPos === chunk.length-1){
              let nextChunk = chunk.subarray(0, chunk.length-1);

              if(self.current){
                self.chunksToPush.push(Buffer.concat([self.current, nextChunk]))
                self.current = null;
              } else {
                self.chunksToPush.push(nextChunk)
                console.log('nextChunk.length', nextChunk.length)
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
          console.log('chunk foreach', chunk.length)
          let { decrypted } =  decryptSymetricService(chunk, this.key, this.iv)
          console.log('decrypted', decrypted.toString('hex'))
          this.decryptedArr.push(decrypted);
        })
       }
       console.log('this.decryptedArr.length', this.decryptedArr.length)
       console.log('BUFFER CONCAT', Buffer.concat(this.decryptedArr).toString())
        this.decryptedArr.length ? this.push(Buffer.concat(this.decryptedArr)) : done();
      } catch (error) {
          console.log(error, 'Error catch in DecryptSymetricStream')
      }
    }

    _flush(){
      if(this.current){
        let { decrypted } =  decryptSymetricService(this.current, this.key, this.iv)
        this.push(decrypted);
      }
    }
}

module.exports = DecryptSymetricSplittedStream;

// 16 - 128 - 128 - 127 - 112