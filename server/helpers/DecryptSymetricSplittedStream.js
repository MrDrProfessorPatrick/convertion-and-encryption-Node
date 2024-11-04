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

        function chunkHandler(chunk, current){
          if(chunk.length === 0) return; 

          function findChunkByDelimiter(chunk, chunksToPush){

            let delimPos = chunk.indexOf("|");
    console.log('delimPos', delimPos, chunk.length-1)
            if(delimPos === -1){
              if(current){
                current = Buffer.concat([current, chunk])
              } else {
                current = chunk;
              }
              console.log('delimPos = -1', chunk.toString())
              // done()
              return;
            }

            if(delimPos === 0){
              let nextChunk = chunk.subarray(1) // sadfsadfsdf|safsaf
              if(current){
                chunksToPush.push(current);
                console.log('chunk', current.length)
                current = null;
                return findChunkByDelimiter(nextChunk, chunksToPush);
              } else {
                return findChunkByDelimiter(nextChunk, chunksToPush);
              }
            }
      
            if(delimPos > 0 && delimPos < chunk.length-1){
              let prevChunk = chunk.subarray(0, delimPos);
              let nextChunk = chunk.subarray(delimPos+1) //doesn't include |

              if(current){
                let fullChunk = Buffer.concat([current, prevChunk]);
                chunksToPush.push(fullChunk);
                console.log('chunk', fullChunk.length)
                current = null;
              } else {
                chunksToPush.push(prevChunk);
                console.log('chunk', prevChunk.length)
              }

              return findChunkByDelimiter(nextChunk, chunksToPush)
            }
      
            if(delimPos === chunk.length-1){
              let nextChunk = chunk.subarray(0, chunk.length-1);

              if(current){
                chunksToPush.push(Buffer.concat([current, nextChunk]))
                console.log('chunk', Buffer.concat([current, nextChunk]).length)
                current = null;
              } else {
                chunksToPush.push(nextChunk)
                console.log('chunk', nextChunk.length)

              }
              // self.push(Buffer.from(self.chunksToPush))
              // done()
              return
            }
          }

          findChunkByDelimiter(chunk, self.chunksToPush)
        }
        
        chunkHandler(chunk, this.current)

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
