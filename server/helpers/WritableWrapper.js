const { Writable } = require('node:stream');

class WritableWrapper extends Writable {
    constructor(options) {
        super();
        this.wrappedWritable = options;
        this.count = 0;
        this.tempBuffer = Buffer.from([]);
    }

    _write(chunk, encoding, cb){
        console.log('chunk to string', chunk.toString())
        if(chunk.toString() === '0'){
            console.log('STREAM END')
            this.end()
            this.destroy()
            cb()
        }
        // this.count++;
        // console.log('this.count', this.count)
        
        // if(this.count > 0) {
        //     if(this.tempBuffer.length > 0){
        //         this.tempBuffer = Buffer.concat([this.tempBuffer, chunk]);
        //         this.wrappedWritable.write(this.tempBuffer);
        //         this.tempBuffer = Buffer.from([]);
        //     } else {
        //         this.wrappedWritable.write(chunk)
        //     }
        // }
        //     this.tempBuffer = Buffer.concat([this.tempBuffer, chunk]);
        // cb();
    }
}

module.exports = WritableWrapper;