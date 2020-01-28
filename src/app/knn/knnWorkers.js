import { environment } from 'src/environments/environment';

'use strict';

export const knnWorkers = [];

for (let i = 0; i < environment.maxNumWorkers; i++) {
    knnWorkers.push(new Worker('./knn.worker', { type: 'module' }));
}