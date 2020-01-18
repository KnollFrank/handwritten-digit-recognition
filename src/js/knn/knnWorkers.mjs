import { KnnWorkerSync } from './knnWorkerSync.mjs';

'use strict';

export const knnWorkers = [];

const createKnnWorker =
    ({ async }) => async ? new Worker('js/knn/knnWorkerAsync.js') : new KnnWorkerSync();

for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
    knnWorkers.push(createKnnWorker({ async: true }));
}