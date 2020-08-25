
let configFile = "./config.json";
const config = require(configFile);
const {fork} = require("child_process");

let index = require(config.indexFile);

let subConfig = {
    range: null,
    apiThrottle: config.apiThrottle,
    loopThrottle: config.loopThrottle,
    name: config.name,
    includeHeader: true,
    cleanup: config.cleanup,
    retryLimit: config.retry,
    indexFile: config.indexFile,
    apiThrottle: config.apiSpawnLimit,
    input: config.input,
    output: config.output
};

let metaLen = Object.keys(index.files).length;

let processLimit = Math.min(metaLen, config.processes);

let chunkSizeLow = Math.floor(metaLen / processLimit);
let chunkSizeHigh = chunkSizeLow + 1;

let leftover = metaLen % processLimit;

let procLimitHigh = leftover;
let procLimitLow = processLimit - procLimitHigh;

//generate ranges
let ranges = [];

let s = 0;
//ranges are [low, high)

for(let i = 0; i < procLimitLow; i++) {
    ranges.push([s, s + chunkSizeLow]);
    s += chunkSizeLow;
}

for(let i = 0; i < procLimitHigh; i++) {
    ranges.push([s, s + chunkSizeHigh]);
    s += chunkSizeHigh;
}



//sanity check
if(s != metaLen || ranges.length != processLimit) {
    console.log(s, metaLen, ranges.length, processLimit);
    errorExit("Failed sanity check, index file not chunked correctly.");
}

let children = [];
for(let range of ranges) {
    subConfig.range = range;

    let child = fork("geotiffDriver", [JSON.stringify(subConfig)]);

    child.on("exit", (code) => {
        if(code != 0) {
            //should write log of errors etc for children
            errorExit(`Child process failed with non-zero exit code. See log for details. Exit code ${code}. Terminating program.`);
        }
    });
    children.push(child);
    subConfig.includeHeader = false;
}

function errorExit(e) {
    console.error(`Critical error in controller. The process will exit.\n${e.toString()}`);
    cleanup();
    process.exit(1);
}

function cleanup() {
    if(children) {
        for(let child of children) {
            child.kill();
        }
    }
}