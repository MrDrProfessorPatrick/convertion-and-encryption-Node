const { Writable, Transform } = require("stream");

class StreamAborter extends Transform {
    constructor(options) {
        super(options);
        this.myEmitter = options;
        this.counter = 0
        this.collector = [];
        this.isEmitted = false;
    }

    _transform(chunk, encoding, done) {
        this.counter++;
        this.collector.push(chunk);
        if(this.counter > 2) {
            !this.isEmitted && this.myEmitter.emit('custom', this);
            this.isEmitted = true;

            if(this.collector.length > 0) {
                this.collector.forEach((chunk) => {
                    this.push(chunk);
                });
                this.collector = [];
             }
        }
        done();
    }
}

module.exports = StreamAborter;