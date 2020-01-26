'use strict';

export const knnWorkers = [];

for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
    knnWorkers.push(new Worker('./knn/knn.worker', { type: 'module' }));
}