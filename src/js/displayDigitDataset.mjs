import { Digit } from './digit.mjs';

'use strict';

class DisplayDigitDatasetTemplate {

    constructor(onDigitClickedReceiveRow, imageWidth, imageHeight) {
        this.onDigitClickedReceiveRow = onDigitClickedReceiveRow;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
    }

    displayDigitDataset(digitDataset, digitsContainerId) {
        const digitsContainer = document.querySelector('#' + digitsContainerId);
        // FK-TODO: extract method
        while (digitsContainer.firstChild) {
            digitsContainer.removeChild(digitsContainer.firstChild);
        }
        for (let i = 0; i < digitDataset.length; i++) {
            const digit = new Digit(this.imageWidth, this.imageHeight);
            digit.setFigcaption(...this._getFigcaption(digitDataset[i], i));
            digit.setImage(digitDataset[i]);
            digit.setOnClicked(() => this.onDigitClickedReceiveRow(digitDataset[i]));
            digitsContainer.appendChild(digit.digitElement);
        }
    }

    _getFigcaption(row, i) {
        throw new Error('You have to build your own figcaption');
    }
}

class DisplayDigitTrainDataset extends DisplayDigitDatasetTemplate {

    constructor(imageWidth, imageHeight) {
        super(row => {}, imageWidth, imageHeight);
    }

    _getFigcaption(row) {
        return [getClassValFromRow(row)];
    }
}

export function displayDigitTrainDataset(datasetDescription, digitsContainerId, maxDigits2Display) {
    new DisplayDigitTrainDataset(datasetDescription.imageWidth, datasetDescription.imageHeight)
        .displayDigitDataset(
            datasetDescription.splittedDataset.train.slice(0, maxDigits2Display),
            digitsContainerId);
}

// FK-TODO: refactor
export function displayDigitDataset(dataset, imageWidth, imageHeight, digitsContainerId) {
    new DisplayDigitTrainDataset(imageWidth, imageHeight).displayDigitDataset(dataset, digitsContainerId);
}

class DisplayDigitTestDataset extends DisplayDigitDatasetTemplate {

    constructor(predictions, onDigitClickedReceiveRow, imageWidth, imageHeight) {
        super(onDigitClickedReceiveRow, imageWidth, imageHeight);
        this.predictions = predictions;
    }

    _getFigcaption(row, i) {
        const actualDigit = getClassValFromRow(row);
        const predictedDigit = this.predictions[i];
        return [predictedDigit, actualDigit != predictedDigit ? 'wrongPrediction' : undefined];
    }
}

export function displayDigitTestDataset({ datasetDescription, predictions, digitsContainerId, onDigitClickedReceiveRow, maxDigits2Display }) {
    new DisplayDigitTestDataset(predictions.slice(0, maxDigits2Display), onDigitClickedReceiveRow, datasetDescription.imageWidth, datasetDescription.imageHeight)
        .displayDigitDataset(
            datasetDescription.splittedDataset.test.slice(0, maxDigits2Display),
            digitsContainerId);
}