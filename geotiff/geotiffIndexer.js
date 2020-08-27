const fs = require("fs");


let config = {
    dir: "./rf_mm",
    output: "./index.json",
    setIdentifiers: {
        type: "raster",
        unit: "mm",
        extent: "state",
        version: "v1.0",
        period: "monthly",
        datatype: "rainfall",
        dataset: "new", //alternate "legacy" (Abby's)
        coverage: "1990-p",
    },
    subMeta: {
        year: null,
        month: null,
        day: null
    },
    nameFormat: {
        delimiter: "_",
        fields: {
            year: {
                index: 0,
                processor: (value) => {return Number.parseInt(value)}
            },
            month: {
                index: 1,
                processor: (value) => {return Number.parseInt(value)}
            }
        }
    }
};

 

function fillMetadataFromFname(fname, metadata, nameFormat) {
    let parts = fname.split(nameFormat.delimiter);
    for(let part in nameFormat.fields) {
        let fieldInfo = nameFormat.fields[part];
        metadata[part] = parts[fieldInfo.index];
        if(fieldInfo.processor) {
            metadata[part] = fieldInfo.processor(metadata[part]);
        }
        
    }
}

function copyJSON(json) {
    return JSON.parse(JSON.stringify(json));
}

let allMeta = {
    datasetID: config.setIdentifiers,
    files: {}
}

fs.readdir(config.dir, (e, files) => {
    if(e) {
        throw e;
    }
    for(let file of files) {
        let meta = copyJSON(config.subMeta);
        fillMetadataFromFname(file, meta, config.nameFormat);
        allMeta.files[file] = meta;
    }
    fs.writeFile(config.output, JSON.stringify(allMeta, null, 2), (e) => {
        if(e) {
            throw e;
        }
        console.log("Complete!");
    })
});

// interface Metadata {
//     unit: string | null,
//     extent: string | null,
//     version: string | null,
//     period: string | null,
//     datatype: string | null,
//     dataset: string | null,
//     coverage: string | null,
//     year: number | null,
//     month: number | null,
//     day: number | null
// }

// interface NameFormat {
//     delimiter: string,
//     fields: {
//         [field in keyof Metadata]: number
//     }
// }

// interface Config {
//     metadata: Metadata,
//     nameFormat: NameFormat
// }