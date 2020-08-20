

let range = [0, 4];

let indexFile = "index.json";

let index = require(indexFile);
//assumes order returned by Object.keys is stable, should be
let files = Object.keys(index);
for(let i = range[0]; i < range[1]; i++) {
    let file = files[i];
    let metadata = index[file];
    //get geotiff data
    let data = {};
    metadata.data = data;
    //submit to api
}

let latestMeta = {
    type: "latest",
    uuid: null
}