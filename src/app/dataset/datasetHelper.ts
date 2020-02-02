'use strict';

// FK-TODO: move to datasetDescription?
export function getClassValFromRow(row) {
    return row[row.length - 1];
}

// FK-TODO: move to datasetDescription?
export function getClassValsFromRows(dataset) {
    return Array.from(new Set(dataset.map(getClassValFromRow)));
}

// FK-TODO: move to datasetDescription?
export function getIndependentValsFromRow(row, datasetDescription) {
    return row.slice(0, datasetDescription.attributeNames.X.length);
}