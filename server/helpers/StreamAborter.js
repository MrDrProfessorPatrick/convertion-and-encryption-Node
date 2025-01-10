const { Writable } = require("stream");

class StreamAborter extends Writable {
    constructor(options) {
        super(options);
        this.ac = options.ac;
        this.counter = 0
    }

    _write(chunk, encoding, done) {
        this.counter++;
        if(this.counter > 2){
            this.ac.abort();
            done('AbortError');
            return;
        }

        done();
    }
}

module.exports = StreamAborter;