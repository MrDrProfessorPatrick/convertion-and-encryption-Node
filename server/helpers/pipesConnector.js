const { PassThrough, EventEmitter, Transform } = require('node:stream');
const { pipeline } = require("node:stream/promises");
const { Writable } = require('node:stream');
const WritableWrapper = require('./WritableWrapper');

function handleError (err, streams) {
    console.log('handleError')
    streams.forEach((stream)=>{
        console.log('instanceof', stream.constructor.name)
        if(stream.constructor.name === 'FileStream') stream.close();
        stream.end();
        stream.close();
        stream.destroy();
    });
}

async function pipesConnector(readable, decompression, fn) {
    try {
        let pipeCount = 0;
        let connector = new PassThrough();
        const customWritable = new WritableWrapper()

        class CustomConnect extends Transform {
            _transform(chunk, encoding, cb){
                if(true) {
                }
                if(pipeCount >= 1){ 
                    this.push(Buffer.from('0'))
                    handleError(null, [readable, decompression, customConnect])
                    cb()
                    return;
                    // console.log('PUSHING NULL')
                    // this.end();
                    // handleError(null, [readable, decompression, customConnect, connector])
                    // this.push(null)
                    // cb();
                    // // handleError(null, [readable, decompression, customConnect, connector])
                    // return;
                    // throw new Error('Error thrown by CustomConnect')
                }
                pipeCount++;
                console.log('pipeCount', pipeCount);
                this.push(Buffer.from('0'))
                cb();
            }
        }

        let customConnect = new CustomConnect();
        // let cnt = 0

        // readable.on('data', ()=>{
        //     cnt++;
        //     if(cnt > 0){
        //         // readable.close();
        //         readable.unpipe(connector);
        //         readable.destroy();
        //         decompression.destroy();
        //         connector.destroy();
        //         // readable.end();
        //     }
        // })

        let result = await pipeline(readable, decompression, connector);
        console.log('result', result)

        // return new Promise((resolve, reject) => {
        //     resolve('pipesConnector done')
        // })

    } catch (error) {
       console.log('pipesConnector ERROR', error);
       throw new Error(error);
    }
}

module.exports = pipesConnector;