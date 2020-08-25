const {spawn} = require("child_process");
const fs = require("fs");

function cleanupFile(fname) {
    return new Promise((resolve, reject) => {
        fs.unlink(fname, (e) => {
            if(e) {
                reject(e)
            }
            else {
                resolve();
            }
        });
    });
}

function addMeta(metaFile, container) {
    return new Promise((resolve, reject) => {
        let child = container == null ? spawn("bash", ["./bin/agave_local/add_meta.sh", metaFile]) : spawn("bash", ["./bin/agave_containerized/add_meta.sh", container, metaFile]);
        let response = "";
        child.stdout.on('data', (data) => {
            response += data
        });
        //could not spawn bash process
        child.on("error", (e) => {
            reject(e);
        });
        child.stderr.on('data', (e) => {
            reject(e);
        });
        child.on('close', (code) => {
            response = response.split(" ");
            response = response[response.length - 1];
            //response = JSON.parse(response);
            if(code == 0) {
                resolve(response);
            }
            else {
                reject(`Child process exited with code ${code}.`);
            }
        });
        
    });
    
}

function writeMeta(fname, metadataString) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fname, metadataString, {}, (e) => {
            if(e) {
                reject(e)
            }
            else {
                resolve();
            }
        });
    });
}


function ingestData(fname, metadata, cleanup, container) {
    let metadataString = JSON.stringify(metadata);
    return new Promise((resolve, reject) => {
        writeMeta(fname, metadataString).then(() => {
            addMeta(fname, container).then((res) => {
                if(cleanup) {
                    cleanupFile(fname).then(() => {
                        resolve(res);
                    }, (e) => {
                        resolve(res);
                    });
                }
            }, (e) => {
                reject(e)
                //still try to cleanup, but ignore output
                if(cleanup) {
                    cleanupFile(fname);
                }
            });
        }, (e) => {
            reject(e)
        });
        
    });
    
}

//no communication, set data handler

function dataHandlerRecursive(fname, metadata, retryLimit, cleanup, container, attempt = 0) {
    return ingestData(fname, metadata, cleanup, container).then((error) => {
        return error;
    }, (error) => {
        if(attempt >= retryLimit) {
            return Promise.reject(error);
        }
        else {
            return dataHandlerRecursive(fname, metadata, retryLimit, cleanup, container, attempt + 1);
        }
    });
}

function dataHandler(fname, metadata, retryLimit, cleanup, container = null) {
    return dataHandlerRecursive(fname, metadata, retryLimit, cleanup, container);
}

module.exports.dataHandler = dataHandler;