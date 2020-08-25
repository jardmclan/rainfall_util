import "fs";
import "csv-parser"

source = fs.createReadStream(options.dataFile)
.pipe(csv({
    headers: false
}));