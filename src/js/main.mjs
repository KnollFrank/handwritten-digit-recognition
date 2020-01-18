import { Cache } from './cache.mjs';
import { TimedExecutor } from './timedExecutor.mjs'
import { displayTextDataInput, highlightPredictionInNetwork, displayCanvasDataInput } from './dataInput.mjs';
import { displayDigitTrainDataset, displayDigitTestDataset, displayDigitDataset } from './displayDigitDataset.mjs';
import { getInputValueById } from './htmlHelper.mjs';
import { createProgressElements, setProgress_numberOfEntriesInDataset, setProgress_workerId, setProgress_progress, setProgress_startAttribute, setProgress_endAttribute } from './progress.mjs';
import { createKnnProgressElements, setKnnProgress_workerId, setKnnProgress_progress } from './knn/knnProgress.mjs';
import { ClassifierType } from './classifierType.mjs';
import { displayDatasetAsTable } from './datasetTable.mjs';
import { SubmitEventListenerHolder, EventListenerHolder } from './eventListenerHolders.mjs';
import { NetworkBuilder, displayNetwork } from './network.mjs'
import { DecisionTreeBuilder } from './decisionTree/decisionTreeBuilder.mjs';
import { print_tree } from './decisionTree/decisionTreePrinter.mjs';
import { SimpleNodeContentFactory } from './decisionTree/nodeContentFactories.mjs';
import { predict } from './decisionTree/decisionTree.mjs';
import { knnWorkers } from './knn/knnWorkers.mjs';
import { splitterWorkers } from './decisionTree/splitterWorkers.mjs';
import { splitItemsIntoChunks } from './itemsIntoChunksSplitter.mjs';

'use strict';

// FK-TODO: verwende import export
// see https://www.joyofdata.de/blog/parsing-local-csv-file-with-javascript-papa-parse/

const submitEventListenerHolder4decisionTreeForm =
    new SubmitEventListenerHolder(() => document.querySelector('#decisionTreeForm'));

const submitEventListenerHolder4knnForm =
    new SubmitEventListenerHolder(() => document.querySelector('#knnForm'));

const submitEventListenerHolder4datasetForm =
    new SubmitEventListenerHolder(() => document.querySelector('#datasetForm'));

const clickEventListenerHolder4EvaluateTestdataButton =
    new EventListenerHolder(
        'click',
        () => document.querySelector('#section-testdata .evaluate-testdata-button'));

const changeEventListenerHolder4EnhancedSwitcher =
    new EventListenerHolder(
        'change',
        () => document.querySelector('#decisionTreeNetwork-enhanced-switcher input[type=checkbox]'));

document.addEventListener('DOMContentLoaded', () => {
    const classifierType = getClassifierTypeFromDocumentsURL();
    setH1(classifierType);
    $('#datasetForm input[type=submit], #kernelWidthAndHeight-inputFields, #section-traindata, #section-decision-tree, #section-KNN, #section-data-input, #section-testdata').fadeOut();
    let dataFile;
    document.querySelector('#csv-file').addEventListener('change', evt => {
        dataFile = evt.target.files[0];
        onCsvFileSelected(dataFile, classifierType);
    });

    submitEventListenerHolder4datasetForm.setEventListener(() => onSubmitDatasetForm(dataFile, classifierType));
});

function onCsvFileSelected(dataFile, classifierType) {
    if (isFileDigitDataset(dataFile.name)) {
        $('#datasetForm input[type=submit], #kernelWidthAndHeight-inputFields').fadeIn();
    } else {
        $('#datasetForm input[type=submit], #kernelWidthAndHeight-inputFields').fadeOut();
        onSubmitDatasetForm(dataFile, classifierType);
    }
}

function onSubmitDatasetForm(dataFile, classifierType) {
    Papa.parse(dataFile, {
        download: true,
        header: false,
        complete: function(results) {
            let datasetDescription = getDatasetDescription(dataFile.name, results.data);
            if (datasetDescription.isDigitDataset()) {
                datasetDescription = transform(datasetDescription, getSelectedKernelWidthAndHeight());
            }

            onDatasetChanged(datasetDescription, classifierType);
        }
    });
}

function getSelectedKernelWidthAndHeight() {
    const selectTag = document.querySelector('#kernelWidthAndHeight');
    return selectTag.options[selectTag.selectedIndex].value;
}

function getClassifierTypeFromDocumentsURL() {
    const params = (new URL(document.location)).searchParams;
    return ClassifierType.from(params.get('classifier'));
}

function setH1(classifierType) {
    document.querySelector('h1').textContent = getH1(classifierType);
}

function getH1(classifierType) {
    return classifierType == ClassifierType.DECISION_TREE ?
        'Entscheidungsbäume' :
        'k nächste Nachbarn';
}

function isFileDigitDataset(fileName) {
    return fileName.toLowerCase().startsWith('mnist');
}

function getDatasetDescription(fileName, dataset) {
    let attributeNames = dataset[0];
    // remove header (= column names) of dataset
    dataset.splice(0, 1);
    const datasetDescription = {
        fileName: fileName,
        attributeNames: {
            X: attributeNames.slice(0, -1),
            y: attributeNames[attributeNames.length - 1],
            all: attributeNames
        },
        splittedDataset: train_test_split(dataset, 0.8),
        isDigitDataset: function() {
            return isFileDigitDataset(this.fileName);
        }
    };

    if (datasetDescription.isDigitDataset()) {
        datasetDescription.imageWidth = 28;
        datasetDescription.imageHeight = 28;
    }

    return datasetDescription;
}

function transform(datasetDescription, kernelWidthAndHeight) {
    const getScaledImageForRow = row => {
        const strings2Numbers = strings => strings.map(string => Number(string));

        return getScaledImage({
            image: {
                pixels: strings2Numbers(getIndependentValsFromRow(row, datasetDescription)),
                width: datasetDescription.imageWidth,
                height: datasetDescription.imageHeight
            },
            kernelWidthAndHeight: Number(kernelWidthAndHeight)
        });
    };

    const transform = row => getScaledImageForRow(row).pixels.concat(getClassValFromRow(row));
    const someTransformedImage = getScaledImageForRow(datasetDescription.splittedDataset.train[0])

    const transformedDatasetDescription = {
        fileName: datasetDescription.fileName,
        attributeNames: {
            X: createRowColLabels(someTransformedImage.height, someTransformedImage.width),
            y: datasetDescription.attributeNames.y,
            get all() {
                return this.X.concat(this.y);
            }
        },
        splittedDataset: {
            train: datasetDescription.splittedDataset.train.map(transform),
            test: datasetDescription.splittedDataset.test.map(transform)
        },
        isDigitDataset: datasetDescription.isDigitDataset,
        imageWidth: someTransformedImage.width,
        imageHeight: someTransformedImage.height
    };

    return transformedDatasetDescription;
}

function createRowColLabels(numRows, numCols) {
    const rowColLabels = [];
    for (let row = 1; row <= numRows; row++) {
        for (let col = 1; col <= numCols; col++) {
            rowColLabels.push(`${row}x${col}`);
        }
    }
    return rowColLabels;
}

function getScaledImage({
    image,
    kernelWidthAndHeight
}) {
    const scaledImage_width = image.width / kernelWidthAndHeight;
    const scaledImage_height = image.height / kernelWidthAndHeight;
    const scaledImage = {
        pixels: Array(scaledImage_width * scaledImage_height).fill(0),
        width: scaledImage_width,
        height: scaledImage_height
    };

    for (let y = 0; y + kernelWidthAndHeight <= image.height; y += kernelWidthAndHeight) {
        for (let x = 0; x + kernelWidthAndHeight <= image.width; x += kernelWidthAndHeight) {
            const getPixelWithinKernel =
                (kernelX, kernelY) => getPixel({
                    image: image,
                    point: {
                        x: x + kernelX,
                        y: y + kernelY
                    }
                });
            putPixel({
                image: scaledImage,
                point: {
                    x: x / kernelWidthAndHeight,
                    y: y / kernelWidthAndHeight
                },
                pixel: getAveragePixelValueWithinKernel(kernelWidthAndHeight, getPixelWithinKernel)
            });
        }
    }

    return scaledImage;
}

function getAveragePixelValueWithinKernel(kernelWidthAndHeight, getPixel) {
    let sum = 0;
    for (let y = 0; y < kernelWidthAndHeight; y++) {
        for (let x = 0; x < kernelWidthAndHeight; x++) {
            sum += getPixel(x, y);
        }
    }
    return Math.round(sum / (kernelWidthAndHeight ** 2));;
}

function getPixel({
    image: {
        pixels,
        width
    },
    point: {
        x,
        y
    }
}) {
    return pixels[y * width + x];
}

function putPixel({
    image: {
        pixels,
        width
    },
    point: {
        x,
        y
    },
    pixel
}) {
    pixels[y * width + x] = pixel;
}

function train_test_split(dataset, train_proportion) {
    const end = train_proportion * dataset.length;
    return {
        train: dataset.slice(0, end),
        test: dataset.slice(end)
    };
}

function onDatasetChanged(datasetDescription, classifierType) {
    showSectionFor(classifierType);
    $('#section-traindata').fadeIn();
    $('#progress, #subsection-decision-tree').fadeOut();
    $('#section-data-input, #section-testdata').fadeOut();
    if (datasetDescription.isDigitDataset()) {
        $('#container-digits-train').fadeIn();
        $('#container-trainingDataSet').fadeOut();
        const maxDigits2Display = 500;
        display_maxDigits2Display_totalNumberOfDigits({
            root: document.querySelector('#section-traindata'),
            maxDigits2Display,
            totalNumberOfDigits: datasetDescription.splittedDataset.train.length
        });
        displayDigitTrainDataset(datasetDescription, 'container-digits-train', maxDigits2Display);
    } else {
        $('#container-digits-train').fadeOut();
        $('#container-trainingDataSet').fadeIn();
        displayDatasetAsTable({
            tableContainer: $('#container-trainingDataSet'),
            attributeNames: datasetDescription.attributeNames.all,
            dataset: datasetDescription.splittedDataset.train
        });
    }
    build_classifier_onSubmit(datasetDescription, classifierType);
    configure_load_tree(datasetDescription);
}

function display_maxDigits2Display_totalNumberOfDigits({
    root,
    maxDigits2Display,
    totalNumberOfDigits
}) {
    root.querySelector('.maxDigits2Display').textContent = Math.min(maxDigits2Display, totalNumberOfDigits);
    root.querySelector('.totalNumberOfDigits').textContent = totalNumberOfDigits;
}

function showSectionFor(classifierType) {
    if (classifierType == ClassifierType.DECISION_TREE) {
        $('#section-decision-tree').fadeIn();
        $('#section-KNN').fadeOut();
    } else {
        $('#section-decision-tree').fadeOut();
        $('#section-KNN').fadeIn();
    }
}

function build_classifier_onSubmit(datasetDescription, classifierType) {
    if (classifierType == ClassifierType.DECISION_TREE) {
        submitEventListenerHolder4decisionTreeForm.setEventListener(
            () =>
            buildDecisionTreeClassifier({
                datasetDescription,
                max_depth: getInputValueById('max_depth'),
                min_size: getInputValueById('min_size')
            }));
    } else {
        submitEventListenerHolder4knnForm.setEventListener(
            () => buildKnnClassifier(datasetDescription, getInputValueById('knn-k'), knnWorkers));
    }
}

function buildKnnClassifier(datasetDescription, k, knnWorkers) {
    const fittedKnnWorkers = fitKnnWorkers(
        knnWorkers, {
            X: datasetDescription.splittedDataset.train.map(row => getIndependentValsFromRow(row, datasetDescription)),
            y: datasetDescription.splittedDataset.train.map(getClassValFromRow),
            k: k
        });
    const knnClassifier = createKnnClassifier(fittedKnnWorkers);
    onClassifierBuilt(datasetDescription, knnClassifier, ClassifierType.KNN);
}

function fitKnnWorkers(knnWorkers, fitParams) {
    for (const knnWorker of knnWorkers) {
        fitKnnWorker(knnWorker, fitParams);
    }
    return knnWorkers;
}

function fitKnnWorker(knnWorker, fitParams) {
    knnWorker.postMessage({
        type: 'fit',
        params: fitParams
    });

    knnWorker.onerror = e => console.log(`There is an error with a knnWorker in file ${e.filename}, line ${e.lineno}:`, e.message);
}

const createKnnClassifier =
    knnWorkers =>
    (rows, receivePredictionsForRows) => {
        const chunks = splitItemsIntoChunks({
            numItems: rows.length,
            maxNumChunks: knnWorkers.length
        });
        if (chunks.length == 0) {
            receivePredictionsForRows([]);
        } else {
            createKnnProgressElements('knnProgress', knnWorkers.length);
            const chunksOfPredictions = [];
            chunks.forEach((chunk, i, chunks) => {
                getKNearestNeighbors(
                    knnWorkers[i],
                    i,
                    getSlice(rows, chunk),
                    kNearestNeighborssWithPredictions => {
                        chunksOfPredictions.push({ chunk, kNearestNeighborssWithPredictions });
                        if (chunksOfPredictions.length == chunks.length) {
                            receivePredictionsForRows(combineChunksOfPredictions(chunksOfPredictions));
                        }
                    });
            });
        }
    };

function getSlice(rows, chunk) {
    const {
        zeroBasedStartIndexOfChunk,
        zeroBasedEndIndexExclusiveOfChunk
    } = asJsStartAndEndIndexes(chunk);
    return rows.slice(zeroBasedStartIndexOfChunk, zeroBasedEndIndexExclusiveOfChunk);
}

function asJsStartAndEndIndexes({
    oneBasedStartIndexOfChunk,
    oneBasedEndIndexInclusiveOfChunk
}) {
    const zeroBasedStartIndexOfChunk = oneBasedStartIndexOfChunk - 1;
    const zeroBasedEndIndexInclusiveOfChunk = oneBasedEndIndexInclusiveOfChunk - 1;
    const zeroBasedEndIndexExclusiveOfChunk = zeroBasedEndIndexInclusiveOfChunk + 1;
    return {
        zeroBasedStartIndexOfChunk,
        zeroBasedEndIndexExclusiveOfChunk
    };
}

function getKNearestNeighbors(knnWorker, knnWorkerIndex, X, receivePredictions) {
    knnWorker.onmessage = event => {
        const { type, value } = event.data;
        switch (type) {
            case 'result':
                {
                    const kNearestNeighborss = value;
                    const kNearestNeighborssWithPredictions = kNearestNeighborss.map(addPrediction);
                    receivePredictions(kNearestNeighborssWithPredictions);
                    break;
                }
            case 'progress':
                {
                    const { actualIndexZeroBased, endIndexZeroBasedExclusive } = value;
                    displayKnnProgress(knnWorkerIndex, actualIndexZeroBased, endIndexZeroBasedExclusive);
                    break;
                }
        }
    };

    knnWorker.postMessage({
        type: 'getKNearestNeighbors',
        params: {
            X: X
        }
    });
}

function displayKnnProgress(workerIndex, actualIndexZeroBased, endIndexZeroBasedExclusive) {
    setKnnProgress_workerId(workerIndex, workerIndex + 1);
    setKnnProgress_progress({
        workerIndex: workerIndex,
        value: actualIndexZeroBased + 1,
        max: endIndexZeroBasedExclusive
    });
}

function addPrediction(kNearestNeighbors) {
    return {
        kNearestNeighbors: kNearestNeighbors,
        prediction: getPredictionFromKNearestNeighbors(kNearestNeighbors)
    };
}

function combineChunksOfPredictions(chunksOfPredictions) {
    const predictions = {};
    for (const chunkOfPredictions of chunksOfPredictions) {
        copyChunkOfPredictions2Predictions(chunkOfPredictions, predictions);
    }
    return predictions;
}

function copyChunkOfPredictions2Predictions(chunkOfPredictions, predictions) {
    const {
        zeroBasedStartIndexOfChunk,
        zeroBasedEndIndexExclusiveOfChunk
    } = asJsStartAndEndIndexes(chunkOfPredictions.chunk);
    for (let i = zeroBasedStartIndexOfChunk; i < zeroBasedEndIndexExclusiveOfChunk; i++) {
        predictions[i] = chunkOfPredictions.kNearestNeighborssWithPredictions[i - zeroBasedStartIndexOfChunk];
    }
}

function buildDecisionTreeClassifier({
    datasetDescription,
    max_depth,
    min_size
}) {
    let gNetwork;
    build_tree_with_worker({
            dataset: datasetDescription.splittedDataset.train,
            max_depth: max_depth,
            min_size: min_size
        },
        ({
            type: type,
            value: value
        }) => {
            switch (type) {
                case 'info':
                    gNetwork = addNewNodesAndEdgesToNetwork(datasetDescription, value, gNetwork);
                    break;
                case 'inner-split':
                    const {
                        workerIndex,
                        startSplitIndex,
                        actualSplitIndex,
                        endSplitIndex,
                        numberOfEntriesInDataset
                    } = value;
                    displayProgress({
                        workerIndex,
                        startSplitIndex,
                        actualSplitIndex,
                        endSplitIndex,
                        actualNumberOfEntriesInDataset: numberOfEntriesInDataset,
                        maxNumberOfEntriesInDataset: datasetDescription.splittedDataset.train.length,
                        attributeNames: datasetDescription.attributeNames.X
                    });
                    break;
                case 'result':
                    $('#progress').fadeOut();
                    onClassifierBuilt(datasetDescription, value, ClassifierType.DECISION_TREE);
                    break;
            }
        });
}

function build_tree_with_worker({
    dataset,
    max_depth,
    min_size
}, onmessage) {
    $('#progress, #subsection-decision-tree').fadeIn();
    createProgressElements('progress', splitterWorkers.length);
    new DecisionTreeBuilder(
            max_depth,
            min_size,
            splitterWorkers,
            createTreeListener(onmessage))
        .build_tree(
            dataset,
            tree => onmessage({
                type: 'result',
                value: tree
            }));
}

function addNewNodesAndEdgesToNetwork(datasetDescription, tree, gNetwork) {
    if (!gNetwork) {
        gNetwork = createNetwork(datasetDescription, tree, new SimpleNodeContentFactory());
        displayNetwork(document.querySelector('#decisionTreeNetwork'), gNetwork);
    }
    const network = createNetwork(datasetDescription, tree, new SimpleNodeContentFactory());

    const newNodes = network.nodes.get({
        filter: node => gNetwork.nodes.get(node.id) === null
    });
    gNetwork.nodes.add(newNodes);

    const newEdges = network.edges.get({
        filter: edge => gNetwork.edges.get(edge.id) === null
    });
    gNetwork.edges.add(newEdges);
    return gNetwork;
}

function createNetwork(datasetDescription, tree, nodeContentFactory) {
    return new NetworkBuilder(datasetDescription.attributeNames.X, nodeContentFactory).createNetwork(tree);
}

function displayProgress({
    workerIndex,
    startSplitIndex,
    actualSplitIndex,
    endSplitIndex,
    actualNumberOfEntriesInDataset,
    maxNumberOfEntriesInDataset,
    attributeNames
}) {
    setProgress_numberOfEntriesInDataset({
        value: actualNumberOfEntriesInDataset,
        max: maxNumberOfEntriesInDataset
    });
    setProgress_workerId(workerIndex, workerIndex + 1);
    setProgress_progress({
        workerIndex: workerIndex,
        value: actualSplitIndex - startSplitIndex + 1,
        text: attributeNames[actualSplitIndex],
        max: endSplitIndex - startSplitIndex + 1
    });
    setProgress_startAttribute(workerIndex, attributeNames[startSplitIndex]);
    setProgress_endAttribute(workerIndex, attributeNames[endSplitIndex]);
}

function onClassifierBuilt(datasetDescription, classifier, classifierType) {
    switch (classifierType) {
        case ClassifierType.DECISION_TREE:
            onDecisionTreeChanged(datasetDescription, classifier);
            break;
        case ClassifierType.KNN:
            displayDataInputSectionAndTestdataSectionOnClick(classifier, ClassifierType.KNN, datasetDescription);
            break;
    }
}

function displayDataInputSectionAndTestdataSectionOnClick(classifier, classifierType, datasetDescription, network) {
    $('#section-data-input, #section-testdata').fadeIn();
    display_knnProgress_forKnn(classifierType);
    $('#accuracy-panel, #testdata-panel').fadeOut();
    const rowsClassifier = getRowsClassifier(classifierType, classifier);
    displayDataInput(datasetDescription, getCanvasDataInput(), getTextDataInput(), classifier, network, rowsClassifier, classifierType);
    clickEventListenerHolder4EvaluateTestdataButton.setEventListener(() => displayTestdataSection(rowsClassifier, datasetDescription, classifierType, network, classifier));
}

function display_knnProgress_forKnn(classifierType) {
    if (classifierType == ClassifierType.KNN) {
        $('#knnProgress').fadeIn();
    } else {
        $('#knnProgress').fadeOut();
    }
}

function displayTestdataSection(rowsClassifier, datasetDescription, classifierType, network, classifier) {
    displayAccuracy(
        rowsClassifier,
        datasetDescription,
        datasetDescription.splittedDataset.test,
        () => {
            $('#accuracy-panel').fadeIn();
            displayTestingTableWithPredictions(rowsClassifier, classifierType, network, classifier, datasetDescription);
        });
}

function getCanvasDataInput() {
    return document.querySelector('#canvas-data-input');
}

function getTextDataInput() {
    return document.querySelector('#text-data-input');
}

function getRowsClassifier(classifierType, classifier) {
    const cache = new Cache();
    switch (classifierType) {
        case ClassifierType.DECISION_TREE:
            return (rows, receivePredictionsForRows) => {
                const predictions = rows.map(row => cache.get(row, () => ({ prediction: predict(classifier, row).value })));
                receivePredictionsForRows(predictions);
            };
        case ClassifierType.KNN:
            return (rows, receivePredictionsForRows) => {
                const nonCachedRows = rows.filter(row => !cache.containsKey(row));
                classifier(
                    nonCachedRows,
                    nonCachedPredictions => {
                        cache.cacheValuesForKeys({
                            keys: nonCachedRows,
                            values: nonCachedPredictions
                        });
                        const predictions = cache.getValuesForKeys({
                            keys: rows
                        });
                        receivePredictionsForRows(predictions);
                    });
            }
    }
}

function onDecisionTreeChanged(datasetDescription, tree) {
    const __onDecisionTreeChanged = () =>
        _onDecisionTreeChanged(
            datasetDescription,
            tree,
            changeEventListenerHolder4EnhancedSwitcher.getHtmlElement().checked ?
            new EnhancedNodeContentFactory() :
            new SimpleNodeContentFactory());
    changeEventListenerHolder4EnhancedSwitcher.setEventListener(__onDecisionTreeChanged);
    __onDecisionTreeChanged();
}

function _onDecisionTreeChanged(datasetDescription, tree, nodeContentFactory) {
    $('#subsection-decision-tree').fadeIn();
    const network = createAndDisplayNetwork(datasetDescription, tree, nodeContentFactory);
    print_tree(tree, datasetDescription.attributeNames.all);
    configure_save_tree(tree);
    displayDataInputSectionAndTestdataSectionOnClick(tree, ClassifierType.DECISION_TREE, datasetDescription, network);
}

function displayDataInput(datasetDescription, canvasDataInput, textDataInput, tree, network, rowsClassifier, classifierType) {
    if (datasetDescription.isDigitDataset()) {
        $(canvasDataInput).show();
        $('#new-prediction').show();
        $(textDataInput).hide();
        displayCanvasDataInput(canvasDataInput, tree, network, rowsClassifier, classifierType, datasetDescription.imageWidth, datasetDescription.imageHeight);
    } else {
        $(canvasDataInput).hide();
        $('#new-prediction').hide();
        $(textDataInput).show();
        displayTextDataInput(textDataInput, datasetDescription.attributeNames.X, tree, network, rowsClassifier, classifierType);
    }
}

function createAndDisplayNetwork(datasetDescription, tree, nodeContentFactory) {
    const network = createNetwork(datasetDescription, tree, nodeContentFactory);
    displayNetwork(document.querySelector('#decisionTreeNetwork'), network);
    return network;
}

const localStorageTreeKey = 'tree';

function configure_load_tree(datasetDescription) {
    const load_tree = document.querySelector('#load_tree');
    load_tree.addEventListener('click', () => {
        const tree = JSON.parse(localStorage.getItem(localStorageTreeKey))
        onClassifierBuilt(datasetDescription, tree, ClassifierType.DECISION_TREE);
    });
}

function configure_save_tree(tree) {
    const save_tree = document.querySelector('#save_tree');
    save_tree.addEventListener('click', () =>
        localStorage.setItem(localStorageTreeKey, JSON.stringify(tree))
    );
}

function displayAccuracy(rowsClassifier, datasetDescription, dataset, k) {
    computeAccuracy(
        rowsClassifier,
        datasetDescription,
        dataset,
        accuracy => {
            console.log(`${Math.floor(accuracy)}%`);
            document.querySelector('#accuracy').innerHTML = `${Math.floor(accuracy)}%`;
            k();
        });
}

function computeAccuracy(rowsClassifier, datasetDescription, dataset, receiveAccuracy) {
    rowsClassifier(
        dataset.map(row => getIndependentValsFromRow(row, datasetDescription)),
        kNearestNeighborssWithPredictions =>
        receiveAccuracy(
            accuracy_percentage(
                actualClassVals(dataset),
                getPredictions(kNearestNeighborssWithPredictions)))
    );
}

const actualClassVals = fold => fold.map(getClassValFromRow);

// Calculate accuracy percentage
function accuracy_percentage(actual, predicted) {
    let correct = 0;
    for (let i = 0; i < actual.length; i++) {
        if (actual[i] == predicted[i]) {
            correct++;
        }
    }
    return actual.length != 0 ? correct / actual.length * 100.0 : 0;
}

function getPredictions(kNearestNeighborssWithPredictions) {
    return kNearestNeighborssWithPredictions.map(({ prediction }) => prediction);
}

function displayTestingTableWithPredictions(rowsClassifier, classifierType, network, tree, datasetDescription) {
    function addPredictionAttribute(attributeNames) {
        const lastAttributeName = attributeNames[attributeNames.length - 1];
        return attributeNames.concat('prediction for ' + lastAttributeName);
    }

    function markRowIfItsPredictionIsWrong(row, data) {
        const isRowsPredictionWrong = data[data.length - 2] != data[data.length - 1];
        const markRow = () => $(row).find("td").addClass('wrongPrediction');

        if (isRowsPredictionWrong) {
            markRow();
        }
    }

    $('#testdata-panel').fadeIn();
    if (datasetDescription.isDigitDataset()) {
        $('#section-digits-test').fadeIn();
        $('#container-testDataSet').fadeOut();
        const onDigitClickedReceiveRow =
            classifierType == ClassifierType.DECISION_TREE ?
            row => predictRowAndHighlightInNetwork(row, tree, network, datasetDescription) :
            row => {};
        rowsClassifier(
            datasetDescription.splittedDataset.test.map(row => getIndependentValsFromRow(row, datasetDescription)),
            kNearestNeighborssWithPredictions => {
                const maxDigits2Display = 500;
                display_maxDigits2Display_totalNumberOfDigits({
                    root: document.querySelector('#section-testdata'),
                    maxDigits2Display,
                    totalNumberOfDigits: datasetDescription.splittedDataset.test.length
                });
                displayDigitTestDataset({
                    datasetDescription: datasetDescription,
                    predictions: getPredictions(kNearestNeighborssWithPredictions),
                    digitsContainerId: 'container-digits-test',
                    onDigitClickedReceiveRow: onDigitClickedReceiveRow,
                    maxDigits2Display: maxDigits2Display
                });
            });
    } else {
        $('#section-digits-test').fadeOut();
        $('#container-testDataSet').fadeIn();
        const onRowClicked =
            classifierType == ClassifierType.DECISION_TREE ?
            row => predictRowAndHighlightInNetwork(row, tree, network, datasetDescription) :
            row => {};
        rowsClassifier(
            datasetDescription.splittedDataset.test.map(row => getIndependentValsFromRow(row, datasetDescription)),
            kNearestNeighborssWithPredictions => {
                displayDatasetAsTable({
                    tableContainer: $('#container-testDataSet'),
                    attributeNames: addPredictionAttribute(datasetDescription.attributeNames.all),
                    dataset: addPredictions2Rows(datasetDescription.splittedDataset.test, getPredictions(kNearestNeighborssWithPredictions)),
                    createdRow: markRowIfItsPredictionIsWrong,
                    onRowClicked: onRowClicked
                });
            });
    }
}

function addPredictions2Rows(rows, predictions) {
    const addPrediction2Row = (row, prediction) => row.concat(prediction);
    return zip(rows, predictions).map(([row, prediction]) => addPrediction2Row(row, prediction));
}

function predictRowAndHighlightInNetwork(row, tree, network, datasetDescription) {
    highlightPredictionInNetwork(
        predict(tree, getIndependentValsFromRow(row, datasetDescription)),
        network);
}

function createTreeListener(onmessage) {
    const timedExecutor = new TimedExecutor(100);
    let rootNode;
    return {
        onNodeAdded: node => {
            if (!rootNode) {
                rootNode = node;
            }
            timedExecutor.execute(() => onmessage({
                type: 'info',
                value: rootNode
            }));
        },
        onEdgeAdded: (fromNode, toNode) => {
            timedExecutor.execute(() => onmessage({
                type: 'info',
                value: rootNode
            }));
        },
        onStartSplit: nodeId => {},
        onInnerSplit: ({
            workerIndex,
            nodeId,
            startSplitIndex,
            actualSplitIndex,
            endSplitIndex,
            numberOfEntriesInDataset
        }) => {
            onmessage({
                type: 'inner-split',
                value: {
                    workerIndex,
                    startSplitIndex,
                    actualSplitIndex,
                    endSplitIndex,
                    numberOfEntriesInDataset
                }
            });
        },
        onEndSplit: nodeId => {}
    }
}

export { train_test_split };