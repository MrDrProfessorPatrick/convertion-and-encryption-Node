const { Readable } = require("readable-stream");
const fs = require("node:fs");

class ReadableBitesLimit extends Readable{
    constructor(options){
        super(options)
        this.size = 16384;
        this.path = options.path;
    }

    _read(size){
        // need to check chunk here to know the size to push
    }

}