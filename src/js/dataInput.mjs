import { getInputValueById, getInputValueByName } from './htmlHelper.mjs';
import { imageData2Pixels } from './digit.mjs';
import { getCenterOfMass } from './imageAlgos.mjs';
import { createInputElement } from './inputTemplate.mjs';
import { displayDigitDataset } from './displayDigitDataset.mjs';
import { ClassifierType } from './classifierType.mjs';
import { highlightNodes, highlightEdges } from './network.mjs';
import { predict } from './decisionTree/decisionTree.mjs';

'use strict';

export function displayTextDataInput(rootElement, attributeNames, tree, network, rowsClassifier, classifierType) {
    const dataInputFields = rootElement.querySelector('.dataInputFields');

    dataInputFields.innerHTML = '';
    appendInputElements(dataInputFields, attributeNames);

    rootElement.querySelector('#dataInputForm').addEventListener(
        "submit",
        e => {
            e.preventDefault();
            const setPrediction = prediction =>
                rootElement.querySelector('.prediction').innerHTML = prediction;

            if (classifierType == ClassifierType.DECISION_TREE) {
                const prediction = predict(tree, getInputValuesByName(attributeNames));
                highlightPredictionInNetwork(prediction, network);
                setPrediction(prediction.value);
            } else {
                rowsClassifier([getInputValuesByName(attributeNames)], ([{ prediction }]) => setPrediction(prediction));
            }
            return false;
        });
}

export function displayCanvasDataInput(rootElement, tree, network, rowsClassifier, classifierType, imageWidth, imageHeight) {
    if (classifierType == ClassifierType.DECISION_TREE) {
        rootElement.classList.add('decision-tree');
        rootElement.classList.remove('knn');
        $('#k-nearest-neighbors-section').fadeOut();
    } else {
        rootElement.classList.add('knn');
        rootElement.classList.remove('decision-tree');
        $('#k-nearest-neighbors-section').fadeIn();
    }
    const canvasBig = rootElement.querySelector('#digit-canvas-big');
    const canvasSmall = document.querySelector('#digit-canvas-small');
    canvasSmall.width = imageWidth;
    canvasSmall.height = imageHeight;

    initializeDrawTool(
        canvasBig,
        canvasSmall,
        document.querySelector("#new-prediction"),
        (canvasBig, canvasSmall) => predictDrawnDigit(canvasBig, canvasSmall, tree, network, rowsClassifier, classifierType, imageWidth, imageHeight));
}

function initializeDrawTool(canvasBig, canvasSmall, newPredictionBtn, onDigitDrawn) {
    const ctxBig = canvasBig.getContext('2d');
    ctxBig.globalAlpha = 1;
    ctxBig.globalCompositeOperation = 'source-over';
    ctxBig.strokeStyle = 'black';
    ctxBig.lineWidth = 20;
    ctxBig.lineJoin = ctxBig.lineCap = 'round';
    let last_mouse = { x: 0, y: 0 };
    let mouse = { x: 0, y: 0 };
    let mousedown = false;

    // taken from https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

        return {
            x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
            y: (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
        }
    }

    $(canvasBig)
        .off('mousedown')
        .on('mousedown',
            function(e) {
                last_mouse = mouse = getMousePos(canvasBig, e);
                mousedown = true;
            });

    $(canvasBig)
        .off('mouseup')
        .on('mouseup',
            function(e) {
                mousedown = false;
                onDigitDrawn(canvasBig, canvasSmall);
            });

    $(canvasBig)
        .off('mousemove')
        .on('mousemove',
            function(e) {
                mouse = getMousePos(canvasBig, e);
                if (mousedown) {
                    ctxBig.beginPath();
                    ctxBig.moveTo(last_mouse.x, last_mouse.y);
                    ctxBig.lineTo(mouse.x, mouse.y);
                    ctxBig.stroke();
                }
                last_mouse = mouse;
            });

    $(newPredictionBtn)
        .off('click')
        .on('click',
            () => prepareNewPrediction(canvasBig, canvasSmall));

    prepareNewPrediction(canvasBig, canvasSmall);
}

function prepareNewPrediction(canvasBig, canvasSmall) {
    clearCanvases(canvasBig, canvasSmall);
    document.querySelector('#container-k-nearest-digits').innerHTML = '';
    setPrediction('');
}

function clearCanvases(canvasBig, canvasSmall) {
    clearCanvas(canvasBig);
    clearCanvas(canvasSmall);
}

function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function predictDrawnDigit(canvasBig, canvasSmall, tree, network, rowsClassifier, classifierType, imageWidth, imageHeight) {
    const pixels = getPixels(canvasBig, canvasSmall);
    if (classifierType == ClassifierType.DECISION_TREE) {
        const prediction = predict(tree, pixels);
        highlightPredictionInNetwork(prediction, network);
        setPrediction(prediction.value);
    } else {
        rowsClassifier(
            [pixels],
            ([kNearestNeighborsWithPrediction]) => {
                setPrediction(kNearestNeighborsWithPrediction.prediction);
                displayDigitDataset(
                    // FK-TODO: DRY: dieses Hinzufügen des y-Wertes wird an mehreren Stellen vorgenommen
                    kNearestNeighborsWithPrediction.kNearestNeighbors.map(({ x, y }) => x.concat(y)),
                    imageWidth,
                    imageHeight,
                    'container-k-nearest-digits');
            });
    }
}

function setPrediction(predictedValue) {
    const canvas = document.querySelector('#prediction-container #digit-canvas-big-result-of-prediction');
    clearCanvas(canvas);
    printCenteredTextIntoCanvas(canvas, predictedValue);
}

function printCenteredTextIntoCanvas(canvas, text) {
    const ctx = canvas.getContext("2d");
    const fontSize = Math.min(canvas.width, canvas.height);
    ctx.font = `${fontSize}px Verdana`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function getPixels(canvasBig, canvasSmall) {
    fitSrc2Dst({ srcCanvas: canvasBig, dstCanvas: canvasSmall });
    const ctxSmall = canvasSmall.getContext('2d');
    const imageData = ctxSmall.getImageData(0, 0, canvasSmall.width, canvasSmall.height);
    return imageData2Pixels(imageData);
}

function fitSrc2Dst({ srcCanvas, dstCanvas }) {
    const imageData =
        srcCanvas
        .getContext('2d')
        .getImageData(0, 0, srcCanvas.width, srcCanvas.height);

    const center = getCenterOfMassOfImageOrDefault({
        imageData: imageData,
        default: { x: srcCanvas.width / 2, y: srcCanvas.height / 2 }
    });

    const newCanvas = $("<canvas>")
        .attr("width", imageData.width)
        .attr("height", imageData.height)[0];

    newCanvas.getContext('2d').putImageData(
        imageData, -(center.x - srcCanvas.width / 2), -(center.y - srcCanvas.height / 2));

    // FK-TODO: refactor
    const originalImageWidthAndHeight = 28;
    const originalBoundingBoxWidthAndHeight = 20;
    const kernelWidthAndHeight = originalImageWidthAndHeight / dstCanvas.width;
    const boundingBoxWidthAndHeight = originalBoundingBoxWidthAndHeight / kernelWidthAndHeight;
    drawScaledAndCenteredImageOntoCanvas({
        canvas: dstCanvas,
        image: newCanvas,
        newImageWidthAndHeight: boundingBoxWidthAndHeight
    });
}

function getCenterOfMassOfImageOrDefault({ imageData, default: defaultValue }) {
    const centerOfMass = getCenterOfMass({
        pixels: imageData2Pixels(imageData),
        width: imageData.width,
        height: imageData.height
    });
    return centerOfMass || defaultValue;
}

function drawScaledAndCenteredImageOntoCanvas({ canvas, image, newImageWidthAndHeight }) {
    clearCanvas(canvas);
    canvas.getContext('2d').drawImage(
        image,
        (canvas.width - newImageWidthAndHeight) / 2,
        (canvas.height - newImageWidthAndHeight) / 2,
        newImageWidthAndHeight,
        newImageWidthAndHeight);
}

export function highlightPredictionInNetwork(prediction, network) {
    const nodeIdsOfPrediction = prediction.nodes.map(node => node.id);
    highlightTreeNodes(network.nodes, nodeIdsOfPrediction);
    highlightTreeEdges(network.edges, nodeIdsOfPrediction);
}

function highlightTreeNodes(networkNodes, nodeIds2Highlight) {
    const networkNodes2Highlight = networkNodes.get({ filter: networkNode => nodeIds2Highlight.includes(networkNode.id) });
    highlightNodes(networkNodes, networkNodes2Highlight);
}

function highlightTreeEdges(networkEdges, nodeIds2Highlight) {
    const networkEdges2Highlight = [];
    for (const [fromId, toId] of getConsecutiveNodes(nodeIds2Highlight)) {
        networkEdges2Highlight.push(getNetworkEdge(networkEdges, fromId, toId));
    }

    highlightEdges(networkEdges, networkEdges2Highlight);
}

function* getConsecutiveNodes(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) {
        yield [nodes[i], nodes[i + 1]];
    }
}

function getNetworkEdge(networkEdges, fromId, toId) {
    return networkEdges.get({
        filter: networkEdge => networkEdge.from == fromId && networkEdge.to == toId
    })[0];
}

function appendInputElements(parent, attributeNames) {
    attributeNames
        .map(createInputElement)
        .forEach(inputElement => parent.appendChild(inputElement));
}

function getInputValuesByName(attributeNames) {
    return attributeNames.map(getInputValueByName);
}