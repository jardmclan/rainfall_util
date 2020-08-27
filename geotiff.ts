import {getDataFromGeoTIFFFile} from "./geotiffProcessor_.js";
import {dataHandler} from "./meta_ingestor";
import Semaphore from "./Semaphore";

let range = [0, 1];
let includeHeader = true;
let retryLimit = 3;
let cleanup = true;
let indexFile = "./index.json";

let latest = null;

let index = require(indexFile);
let docNum = 0;
//assumes order returned by Object.keys is stable, should be
let files = Object.keys(index.files);
for(let i = range[0]; i < range[1]; i++) {
    let file = files[i];
    let metadata = getMetadataBase();
    Object.assign(metadata, index.files[file]);
    //get geotiff data
    getDataFromGeoTIFFFile(`rf_mm/${file}`).then((data: any) => {
        console.log(data.header);
        //check if should include header and first iteration
        if(i == range[0] && includeHeader) {
            let headerMeta = getMetadataBase();
            Object.assign(headerMeta, data.header);
            headerMeta = {
                name: "rasterHeader",
                value: headerMeta
            };
        }
        metadata.data = data.values;
        //wrap
        metadata = {
            name: "raster",
            value: metadata
        };
        //submit to api
        dataHandler(`./output/${docNum++}`, metadata, retryLimit, cleanup);
    });
}

//how to get the uuid??

function checkLatest(metadata: any) {
    //check in order of granularity, year, month, day
    if
    //got to the end so this is the latest
}

function getMetadataBase() {
    return cpJSON(index.datasetID);
}


function cpJSON(json: object) {
    return JSON.parse(JSON.stringify(json));
}



let latestMeta = {
    unit: "mm",
    extent: "state",
    version: "v1.0",
    period: "monthly",
    datatype: "rainfall",
    dataset: "new", //alternate "legacy" (Abby's)
    coverage: "1990-p",
    type: "latest",
    version: "v1",
    uuid: null
}