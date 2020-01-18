 import { getHtml } from './htmlHelper.mjs';

 'use strict';

 export function createProgressElements(progressId, numWorkers) {
     let progressTable = document.querySelector(`#${progressId} div.table`);
     clearTable(progressTable);
     appendRows(progressTable, numWorkers);
 }

 function clearTable(table) {
     table.querySelectorAll('div.table-row').forEach(row => row.remove());
 }

 function appendRows(parent, numWorkers) {
     for (let workerIndex = 0; workerIndex < numWorkers; workerIndex++) {
         parent.appendChild(createRow(workerIndex));
     }
 }

 function createRow(workerIndex) {
     const div = getHtml('progressTemplate.html');
     div.setAttribute('id', createRowId(workerIndex));
     return div;
 }

 export function setProgress_numberOfEntriesInDataset({ value, max }) {
     const meter = document.querySelector('#numberOfEntriesInDataset');
     meter.value = value;
     meter.max = max;
     document.querySelector('#numberOfEntriesInDatasetText').textContent = `(${value}/${max})`;
 }

 export function setProgress_workerId(workerIndex, text) {
     getTableCellOfTableRow(workerIndex, 'div.workerId').innerHTML = text;
 }

 export function setProgress_startAttribute(workerIndex, text) {
     getTableCellOfTableRow(workerIndex, 'div.startAttribute').innerHTML = text;
 }

 function setProgress_actualAttribute(workerIndex, text) {
     getTableCellOfTableRow(workerIndex, 'div.actualAttribute').innerHTML = text;
 }

 export function setProgress_endAttribute(workerIndex, text) {
     getTableCellOfTableRow(workerIndex, 'div.endAttribute').innerHTML = text;
 }

 export function setProgress_progress({ workerIndex, value, text, max }) {
     const progress = getTableCellOfTableRow(workerIndex, 'div.progress progress');
     progress.value = value;
     progress.max = max;
     getTableCellOfTableRow(workerIndex, 'div.progress span').textContent = text;
 }

 function getTableCellOfTableRow(workerIndex, subElementSelector) {
     return getTableRow(workerIndex).querySelector(subElementSelector);
 }

 function getTableRow(workerIndex) {
     return document.querySelector('#' + createRowId(workerIndex));
 }

 function createRowId(workerIndex) {
     return 'worker-' + workerIndex;
 }