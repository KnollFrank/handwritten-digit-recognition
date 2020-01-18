'use strict';

function getNumberOfAttributes(dataset) {
    return dataset[0].length - 1;
}

// FK-TODO: move to datasetDescription?
function getClassValFromRow(row) {
    return row[row.length - 1];
}

// FK-TODO: move to datasetDescription?
function getClassValsFromRows(dataset) {
    return Array.from(new Set(dataset.map(getClassValFromRow)));
}

// FK-TODO: move to datasetDescription?
function getIndependentValsFromRow(row, datasetDescription) {
    return row.slice(0, datasetDescription.attributeNames.X.length);
}