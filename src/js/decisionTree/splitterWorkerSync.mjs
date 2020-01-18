'use strict';

export class SplitterWorkerSync {

    constructor() {
        this.splitterWorker = new SplitterWorker();
    }

    postMessage(message) {
        this.splitterWorker.onmessage(message);
    }

    set onmessage(postMessage) {
        this.splitterWorker.postMessage = message => postMessage({ data: message });
    }

    get onmessage() {
        return this.splitterWorker.postMessage;
    }
}