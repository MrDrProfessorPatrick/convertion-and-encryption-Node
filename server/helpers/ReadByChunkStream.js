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

class ChunkDevide extends Transform {
  constructor(options){
    super(options)
    this.current = null;
  }

  _transform(chunk, encoding, cb){

    function chunkHandler(chunk, current){

      if(chunk.length === 0) return; 

      let delimPos = chunk.indexOf("|");

      if(!delimPos){
        current+=chunk;
        cb()
        return;
      }

      if(delimPos > 0 && current != null){
        let chunkToPush = current + chunk.subarray(0, delimPos+1);
        current = null;
        this.push(chunkToPush);
        if(delimPos <= chunk.length) current = chunk.subarray(delimPos)
        cb()
        return  
      }

      if(delimPos > 0 && current === null){
        let chunkToPush = chunk.subarray(0, delimPos+1);
        this.push(chunkToPush);
        if(delimPos <= chunk.length) current = chunk.subarray(delimPos);
        cb()
        return
      }
      
      if(delimPos === 0 && current != null){
        // adfadf + |asfasdf
        this.push(current);
        current = null;
        let nextDelim = chunk.subarray(1).indexOf('|');
        let newChunk = nextDelim ? chunk.subarray(1, nextDelim+1) : chunk.subarray(1);
        return chunkHandler(newChunk, current);
      }

      if(delimPos === 0 && current != null){
        this.push(this.current)
        let nextDelim = chunk.subarray(1).indexOf('|');
        nextDelim && this.push(this.current) 
        !nextDelim && (current = chunk.subarray(1))
      }
    }
    
    chunkHandler(chunk, this.current)
    
  }
}

class CustomReadable extends Readable {
  constructor(options){
      super(options)
      this.size = 16384;
      this.path = options.path;
  }
  
  _read(size){
    console.log("read called");

  }
}