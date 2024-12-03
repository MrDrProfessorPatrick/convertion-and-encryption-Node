const { EventEmitter } = require("events");


function createBitesCounter(res, compressionInfo){
  const bitesCounter = new EventEmitter();

  bitesCounter
    .on('chunkread',(arg)=>{
      res.write(JSON.stringify(arg))
    })
    .on('chunkreadend',(arg)=>{
      res.write(JSON.stringify(compressionInfo))
      bitesCounter.removeAllListeners()
      res.end()
    })

    return bitesCounter;
}

  module.exports = createBitesCounter;
