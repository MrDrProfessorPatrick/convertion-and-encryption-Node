const { Writable } = require("stream");

class StreamAborter extends Writable {
    constructor(options) {
        super(options);
        this.options = options;
        this.counter = 0
        this.collector = [];
    }

    _write(chunk, encoding, done) {
        console.log('options', this.options);
        console.log('streamaborter', chunk)
        console.log('counter', this.counter);
        this.counter++;
        this.collector.push(chunk);
        if(this.counter > 2) {
            console.log('abortError call')
            done('AbortError');
            return;
        }
        done();
    }
}

module.exports = StreamAborter;