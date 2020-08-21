import {getDataFromGeoTIFFFile} from "./geotiffProcessor_.js";
import {dataHandler} from "./meta_ingestor";
import Semaphore from "./Semaphore";

let range = [0, 1];
let includeHeader = true;
let retryLimit = 3;
let cleanup = true;
let indexFile = "./index.json";



let index = require(indexFile);
let docNum = 0;
//assumes order returned by Object.keys is stable, should be
let files = Object.keys(index.files);
for(let i = range[0]; i < range[1]; i++) {
    let file = files[i];
    let metadata = index.files[file];
    //get geotiff data
    getDataFromGeoTIFFFile(`rf_mm/${file}`).then((data: any) => {
        console.log(data.header);
        //check if should include header and first iteration
        if(i == range[0] && includeHeader) {

        }
        metadata.data = data.values;
        //wrap
        metadata = {
            name: "",
            value: metadata
        };
        //submit to api
        dataHandler(`${docNum++}`, metadata, retryLimit);
    });
}


function getMetadataBase() {
    index.datasetID
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