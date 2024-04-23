const { pipeline } = require("readable-stream");


let pipelineMaker = ({readableStream, writableStream, transformStreams}) => {
  let streams = [readableStream, ...transformStreams, writableStream];
    return pipeline(
        [streams],
        (error) => {
          if (error) {
            console.error("Error catched in Deflate", error);
          }
        }
      ); 
};

module.exports = pipelineMaker;