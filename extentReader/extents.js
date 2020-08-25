

const processor =  require("./geotiffProcessor.js");
const fs = require("fs");

fs.readdir("./input", (err, files) => {
    for(let file of files) {
        processor.getDataFromGeoTIFFFile(`./input/${file}`).then((data) => {
            let extent = file.split("_")[2];
            let header = data.header;
            //latlng order for leaflet (y, x)
            let ll = [header.yllCorner, header.xllCorner];
            let spanX = header.nCols * header.cellXSize;
            let spanY = header.nRows * header.cellYSize;
            let ur = [header.yllCorner + spanY, header.xllCorner + spanX];
            let bounds = [ll, ur];
            console.log(extent, bounds);
        });
    }
});