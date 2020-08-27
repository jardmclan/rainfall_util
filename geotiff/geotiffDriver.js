const processor =  require("./geotiffProcessor.js");
const handler = require("./meta_ingestor");
const Semaphore = require("./Semaphore");
const { v4: uuidv4 } = require('uuid');
const path = require("path");

config = JSON.parse(process.argv[2])

let range = config.range;
let includeHeader = config.includeHeader;
let retryLimit = config.retryLimit;
let cleanup = config.cleanup;
let indexFile = config.indexFile;
let apiThrottleLimit = config.apiThrottle;
let throttleLimit = config.loopThrottle;
let inDir = config.input;
let outDir = config.output;
let throttle = new Semaphore(throttleLimit);
let apiThrottle = new Semaphore(apiThrottleLimit);

let wrapper = {
    name: config.name,
    value: null
};

const index = require(indexFile);

const rasterBase = index.datasetID;

const headerBase = {
    type: "header",
    extent: "state",
    version: rasterBase.version
};

const latestBase = {
    type: "latest",
    reference: cpJSON(rasterBase),
};



let docNum = range[0];
//assumes order returned by Object.keys is stable, should be
let files = Object.keys(index.files);

// console.log(range);

for(let i = range[0]; i < range[1]; i++) {
    throttle.acquire().then(() => {
        let file = files[i];
        let metadata = index.files[file];
        //get geotiff data
        processor.getDataFromGeoTIFFFile(path.join(inDir, file)).then((data) => {
            //check if should include header and first iteration
            if(i == range[0] && includeHeader) {
                constructSubmitMeta(headerBase, data.header, null);
            }
            metadata.data = data.values;
            let cb = (uuid) => {
                if(isLatest(metadata)) {
                    constructSubmitMeta(latestBase, {uuid: uuid}, null);
                }
                throttle.release();
            }
            //submit to api
            constructSubmitMeta(rasterBase, metadata, cb);
            
        });
    });
}


function constructSubmitMeta(metaBase, meta, cb) {
    let metadata = cpJSON(metaBase);
    Object.assign(metadata, meta);
    let wrapped = cpJSON(wrapper);
    wrapped.value = metadata;
    //apiThrottle.acquire().then(() => {
    handler.dataHandler(path.join(outDir, `${uuidv4()}.json`), wrapped, retryLimit, cleanup).then((uuid) => {
        if(cb != null) {
            cb(uuid);
        }
        
        //apiThrottle.release();
        console.log(uuid);
    }, (e) => {
        console.error(e.toString());
        console.error("Ingestion failed");
        process.exit(1);
    });
    //});
    
}

// throttledLoop(range[0], ingestor);

// function throttledLoop(i, exec) {
//     let next = (j) => {
//         throttle.release();
//         throttledLoop(j, exec);
//     }
//     throttle.acquire().then(() => {
//         exec(i, next);
//     });
// }


// function throttledLoop(i: number, upper: number, data: any, exec: (i: number) => void) {
//     throttle.acquire().then(() => {
//         throttledLoopInternal(i, upper, exec);
//     });
// }

// function throttledLoopInternal(i: number, upper: number, data: any, exec: (i: number) => void) {
//     exec(i++);
//     if(i < upper) {
//         throttledLoop(i, upper, exec);
//     }
// }





function cpJSON(json) {
    return JSON.parse(JSON.stringify(json));
}



//just use dec 2019 as latest
function isLatest(metadata) {
    return metadata.year == 2019 && metadata.month == 12;
}


process.on('uncaughtException', (err) => {
    console.log(`Caught exception: ${err}`);
    process.exit(2);
});