'use strict';

export class KnnWorkerSync {

    constructor() {
        this.knnWorker = new KnnWorker();
    }

    postMessage(message) {
        this.knnWorker.onmessage(message);
    }

    set onmessage(postMessage) {
        this.knnWorker.postMessage = message => postMessage({ data: message });
    }

    get onmessage() {
        return this.knnWorker.postMessage;
    }
}