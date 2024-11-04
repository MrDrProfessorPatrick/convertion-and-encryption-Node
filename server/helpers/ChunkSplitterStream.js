const { Readable, Transform } = require("readable-stream");
// check if possible to decrypt part of the text with same iv;

let str = "123-someother";
let strHex = "3132332d736f6d656f74686572";

let strB = Buffer.from(str);
let strHexB = Buffer.from(strHex, "hex");

let delimPos = strHexB.indexOf("-");
let bitesQ = strHexB.subarray(0, delimPos);

console.log(strHexB.toString("hex"));
console.log("delimPos", delimPos);
console.log("bitesQ", bitesQ.toString());

class ChunkSplitter extends Transform {
  constructor(options){
    super(options)
    this.current = null;
    this.chunksToPush = []
  }

  _transform(chunk, encoding, cb){
    let self = this;

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
          cb()
          return;
        }

        if(delimPos === 0){
          let nextChunk = chunk.subarray(1) // sadfsadfsdf|safsaf
          if(current){
            chunksToPush.push(current);
            current = null;
            return findChunkByDelimiter(nextChunk, chunksToPush);
          }
        }
  
        if(delimPos > 0 && delimPos < chunk.length-1){
          let prevChunk = chunk.subarray(0, delimPos+1);
          let nextChunk = chunk.subarray(delimPos+1)

          if(current){
            let fullChunk = Buffer.concat([current, prevChunk]);
            chunksToPush.push(fullChunk);
            current = null;
          } else {
            chunksToPush.push(prevChunk);
          }
          return findChunkByDelimiter(nextChunk, chunksToPush)
        }
  
        if(delimPos === chunk.length-1){
          let nextChunk = chunk.subarray(0, chunk.length-1);

          if(current){
            chunksToPush.push(Buffer.concat([current, nextChunk]))
            current = null;
          } else {
            chunksToPush.push(nextChunk)
          }
          console.log('self.chunksToPush', Buffer.from(self.chunksToPush))
          self.push(Buffer.from(self.chunksToPush))
          cb()
          return
        }
      }

      findChunkByDelimiter(chunk, self.chunksToPush)
    }
    
    chunkHandler(chunk, this.current)
    
  }

  _flush(){
    if(this.current != null){
      this.push(this.current);
      this.current = null;
    }
  }
}

module.exports = ChunkSplitter;