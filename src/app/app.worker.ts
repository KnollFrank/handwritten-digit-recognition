/// <reference lib="webworker" />
////////////////
'use strict';

function sum(numbers) {
    return numbers.reduce((sum, el) => sum + Number(el), 0);
}

function isNumber(n) {
    return !isNaN(n);
}

function zip(array1, array2) {
    return array1.map((value, index) => [value, array2[index]]);
}

function compareFlatArrays(array1, array2) {
    return array1.length === array2.length &&
        array1.every((value, index) => value === array2[index]);
}

// https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
function getElementWithHighestOccurence(array) {
    if (array.length == 0) {
        return null;
    }
    let modeMap = {};
    let maxEl = array[0],
        maxCount = 1;
    for (let i = 0; i < array.length; i++) {
        let el = array[i];
        if (modeMap[el] == null) {
            modeMap[el] = 1;
        } else {
            modeMap[el]++;
        }
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }

    return maxEl;
}

function getMinOfArray(es, getMinElement) {
    return es.reduce(getMinElement);
}

/////////////////////
'use strict';

class KNN {

    k: number;
    X: any;
    y: any;

    constructor(k) {
        this.k = k;
    }

    fit(X, y) {
        this.X = X;
        this.y = y;
    }

    predict(x) {
        return getPredictionFromKNearestNeighbors(this.getKNearestNeighbors(x));
    }

    getKNearestNeighbors(x) {
        const distancesX2x = [];
        for (let i = 0; i < this.X.length; i++) {
            distancesX2x.push({ index: i, distance: getSquaredEuclideanDistance(this.X[i], x) });
        }

        distancesX2x.sort(({ distance: distance1 }, { distance: distance2 }) => distance1 - distance2);

        const k_nearest_neighbors = distancesX2x.slice(0, this.k);

        return k_nearest_neighbors.map(
            ({ index, distance }) =>
                ({
                    x: this.X[index],
                    y: this.y[index],
                    distance: Math.sqrt(distance)
                }));
    }
}

function getSquaredEuclideanDistance(pointA, pointB) {
    return sum(zip(pointA, pointB).map(([coordA, coordB]) => (coordA - coordB) ** 2));
}

function getPredictionFromKNearestNeighbors(kNearestNeighbors) {
    const k_nearest_y2x = kNearestNeighbors.map(({ y }) => y);
    return getElementWithHighestOccurence(k_nearest_y2x);
}


///////////////////////////
'use strict';

class KnnWorker {

    knn;
    postMessage;

    onmessage({ type, params }) {
        switch (type) {
            case 'fit':
                {
                    const { X, y, k } = params;
                    this.knn = new KNN(k);
                    this.knn.fit(X, y);
                    break;
                }
            case 'getKNearestNeighbors':
                {
                    const X = params.X
                    const kNearestNeighborss = X.map((x, index) => {
                        this.postMessage({
                            type: 'progress',
                            value: { actualIndexZeroBased: index, endIndexZeroBasedExclusive: X.length }
                        });
                        return this.knn.getKNearestNeighbors(x);
                    });
                    this.postMessage({ type: 'result', value: kNearestNeighborss });
                    break;
                }
        }
    }
}

const knnWorker = new KnnWorker();

addEventListener('message', ({ data }) => {
    knnWorker.postMessage = data => postMessage(data);
    knnWorker.onmessage(data);
});
