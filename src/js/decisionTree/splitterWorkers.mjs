import { SplitterWorkerSync } from './splitterWorkerSync.mjs';

'use strict';

export const splitterWorkers = [];

const createSplitterWorker =
    ({ async }) => async ? new Worker('js/decisionTree/splitterWorkerAsync.js') : new SplitterWorkerSync();

for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
    splitterWorkers.push(createSplitterWorker({ async: true }));
}