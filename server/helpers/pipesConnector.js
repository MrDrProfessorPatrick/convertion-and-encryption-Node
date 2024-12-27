const { PassThrough, EventEmitter, Transform } = require('node:stream');
const { pipeline } = require("node:stream/promises");
const { Writable } = require('node:stream');

function handleError (err, streams) {
    console.log('handleError')
    streams.forEach((stream)=>{stream.destroy()});
}

async function pipesConnector(readable, decompression, fn) {
    try {
        let pipeCount = 0;
        let connector = new PassThrough();

        class CustomConnect extends Transform {
            _transform(chunk, encoding, cb){
                if(pipeCount >= 1){ 
                    // handleError(null, [readable, decompression, customConnect, connector])
                    this.push(null)
                    cb('Error thrown by CustomConnect');
                    return;
                    // throw new Error('Error thrown by CustomConnect')
                }
                pipeCount++;
                console.log('pipeCount', pipeCount);
                this.push(chunk);
                cb();
            }
        }

    let customConnect = new CustomConnect();

   let pipeLineRes = await pipeline(readable, decompression, customConnect, connector);
        console.log('pipelineRes', pipeLineRes);
    } catch (error) {
       console.log('pipesConnector ERROR', error);
       throw new Error(error);
    }
}

module.exports = pipesConnector;