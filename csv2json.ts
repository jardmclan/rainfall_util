import "fs";
import "process";

console.log("test");

if(process.argv.length < 3) {
    console.error("Must provide config file");
    process.exit(1);
}

let configFile = process.argv[2]

let source = fs.createReadStream(options.dataFile)
.pipe(csv({
    headers: false
}));
