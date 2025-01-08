const zlib = require("zlib");
const { Transform } = require("stream");

class StreamAborter extends Transform {
    constructor(options) {
        super(options);
        this.ac = options.ac;
        this.counter = 0
    }

    _transform(chunk, encoding, done) {
        this.counter++;
        console.log('counter StreamAborter', this.counter);
        if(this.counter > 1){
            console.log('this.ac', this.ac);
            this.ac.abort();
            done('AbortError');
            return;
        }
        console.log('chunk', chunk);

        this.push(chunk);
        done();
    }
}

module.exports = StreamAborter;