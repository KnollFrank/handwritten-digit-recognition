import { getHtml } from './../htmlHelper.mjs';

'use strict';

export function createKnnProgressElements(progressId, numWorkers) {
    let progressTable = document.querySelector(`#${progressId} div.table`);
    clearKnnTable(progressTable);
    appendKnnRows(progressTable, numWorkers);
}

function clearKnnTable(table) {
    table.querySelectorAll('div.table-row').forEach(row => row.remove());
}

function appendKnnRows(parent, numWorkers) {
    for (let workerIndex = 0; workerIndex < numWorkers; workerIndex++) {
        parent.appendChild(createKnnRow(workerIndex));
    }
}

function createKnnRow(workerIndex) {
    const div = getHtml('knnProgressTemplate.html');
    div.setAttribute('id', createKnnRowId(workerIndex));
    return div;
}

export function setKnnProgress_workerId(workerIndex, text) {
    getKnnTableCellOfTableRow(workerIndex, 'div.workerId').innerHTML = text;
}

export function setKnnProgress_progress({ workerIndex, value: actualValue, max: maxValue }) {
    const progress = getKnnTableCellOfTableRow(workerIndex, 'div.progress progress');
    progress.value = actualValue;
    progress.max = maxValue;
    getKnnTableCellOfTableRow(workerIndex, 'div.progress span').textContent = `(${actualValue}/${maxValue})`;
}

function getKnnTableCellOfTableRow(workerIndex, subElementSelector) {
    return getKnnTableRow(workerIndex).querySelector(subElementSelector);
}

function getKnnTableRow(workerIndex) {
    return document.querySelector('#' + createKnnRowId(workerIndex));
}

function createKnnRowId(workerIndex) {
    return 'knnWorker-' + workerIndex;
}