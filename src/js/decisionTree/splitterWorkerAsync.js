'use strict';

importScripts('../idGenerator.js');
importScripts('../jsHelper.js');
importScripts('datasetHelper.js');
importScripts('splitter.js');
importScripts('splitterWorker.js');

onmessage = e => {
    const splitterWorker = new SplitterWorker();
    splitterWorker.postMessage = data => postMessage(data);
    splitterWorker.onmessage(e.data);
};