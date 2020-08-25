module.exports = class Semaphore {
    level = null;
    max = null
    // syncPromise = null;
    q = null;

    constructor(level) {
        this.max = level;
        this.level = level;
        this.q = [];
    }

    acquire() {
        let unblock = null;
        let block = new Promise((resolve) => {
            unblock = resolve;
        });
        if(this.level > 0) {
            this.level--;
            unblock();
        }
        else {
            this.q.push(unblock);
        }
        return block;
    }

    release() {
        if(++this.level > this.max) {
            throw new Error("Semaphore released too many times");
        }
        if(this.q.length > 0) {
            this.level--;
            this.q.shift()();
        }
    }


}