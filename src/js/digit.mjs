import { getHtml } from './htmlHelper.mjs';
import { newId } from './idGenerator.mjs';

'use strict';

export class Digit {

    constructor(imageWidth, imageHeight) {
        this.digitElement = getHtml('digitTemplate.html');
        this.digitElement.setAttribute('id', 'digit-' + newId());
        this._getCanvas().width = imageWidth;
        this._getCanvas().height = imageHeight;
    }

    _getCanvas() {
        return this.digitElement.querySelector('canvas');
    }

    setFigcaption(innerHTML, clazz) {
        const figcaption = this.digitElement.querySelector('figcaption');
        figcaption.innerHTML = innerHTML;
        if (clazz) {
            figcaption.classList.add(clazz);
        }
    }

    setImage(pixels) {
        drawImageIntoCanvas(pixels, this._getCanvas());
    }

    setOnClicked(onClicked) {
        this.digitElement.addEventListener('click', onClicked);
    }
}

function drawImageIntoCanvas(pixels, canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (const it of iterateOverImageData(imageData)) {
        imageData.data[it.color_index.red] = 0;
        imageData.data[it.color_index.green] = 0;
        imageData.data[it.color_index.blue] = 0;
        imageData.data[it.color_index.alpha] = pixels[it.pixelIndex];
    }
    ctx.putImageData(imageData, 0, 0);
}

export function imageData2Pixels(imageData) {
    const pixels = [];
    for (const it of iterateOverImageData(imageData)) {
        pixels.push(imageData.data[it.color_index.alpha]);
    }
    return pixels;
}

function* iterateOverImageData(imageData) {
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const i = getArrayIndexOfPoint({ x, y }, imageData.width);
            yield {
                x: x,
                y: y,
                pixelIndex: i,
                color_index: {
                    red: i * 4 + 0,
                    green: i * 4 + 1,
                    blue: i * 4 + 2,
                    alpha: i * 4 + 3
                }
            };
        }
    }
}

export function getArrayIndexOfPoint(point, width) {
    return point.y * width + point.x;
}