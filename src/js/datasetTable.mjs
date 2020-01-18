import { newId } from './idGenerator.mjs';

export function displayDatasetAsTable({ tableContainer, attributeNames, dataset, createdRow, onRowClicked }) {
    const table = createTableElement();
    tableContainer.empty();
    tableContainer.append(table);

    let dataTable = $('#' + table.id).DataTable({
        data: dataset,
        columns: getColumns(attributeNames),
        createdRow: createdRow || (() => {})
    });

    addRowClickedEventHandler(table.id, dataTable, onRowClicked);
}

function addRowClickedEventHandler(tableId, dataTable, onRowClicked) {
    if (onRowClicked) {
        $(`#${tableId} tbody`).on('click', 'tr', function() {
            let data = dataTable.row(this).data();
            onRowClicked(data);
        });
    }
}

// <table id="datasetTable" class="display" style="width:100%">
function createTableElement() {
    const table = document.createElement('table');
    table.setAttribute('id', '_' + newId());
    table.classList.add('display');
    table.setAttribute("style", "width:100%;");
    return table;
}

function getColumns(attributeNames) {
    return attributeNames.map(
        attributeName => ({
            title: attributeName
        }));
}