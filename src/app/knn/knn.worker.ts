/// <reference lib="webworker" />
import { KnnWorker } from './knnWorker';

const knnWorker = new KnnWorker();

addEventListener('message', ({ data }) => {
    knnWorker.postMessage = data => postMessage(data);
    knnWorker.onmessage(data);
});
