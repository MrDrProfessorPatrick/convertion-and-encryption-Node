const { EventEmitter } = require("events");

const bitesCounter = new EventEmitter();

bitesCounter
  .on('chunkread',(arg)=>{
    res.write(JSON.stringify(arg))
  })
  .on('chunkreadend',(arg)=>{
    res.write(JSON.stringify(compressionInfo))
    res.end()
  })

  module.exports = bitesCounter;
