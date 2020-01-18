import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var getClassValFromRow: any;
declare var getIndependentValsFromRow: any;

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {

  @Output() onReceiveDatasetDescription = new EventEmitter();

  kernelWidthAndHeight: number;

  constructor() { }

  ngOnInit() {
    this.kernelWidthAndHeight = 1;
  }

  onReceiveDatasetDescriptionInner(datasetDescription) {
    console.log('datasetDescription:', datasetDescription);
    if (datasetDescription.isDigitDataset()) {
      datasetDescription = this.transform(datasetDescription, this.kernelWidthAndHeight);
    }

    this.onReceiveDatasetDescription.emit(datasetDescription);
  }

  private transform(datasetDescription, kernelWidthAndHeight) {
    const getScaledImageForRow = row => {
      const strings2Numbers = strings => strings.map(string => Number(string));

      return this.getScaledImage({
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
        X: this.createRowColLabels(someTransformedImage.height, someTransformedImage.width),
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

  private createRowColLabels(numRows, numCols) {
    const rowColLabels = [];
    for (let row = 1; row <= numRows; row++) {
      for (let col = 1; col <= numCols; col++) {
        rowColLabels.push(`${row}x${col}`);
      }
    }
    return rowColLabels;
  }

  private getScaledImage({ image, kernelWidthAndHeight }) {
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
          (kernelX, kernelY) => this.getPixel({
            image: image,
            point: {
              x: x + kernelX,
              y: y + kernelY
            }
          });
        this.putPixel({
          image: scaledImage,
          point: {
            x: x / kernelWidthAndHeight,
            y: y / kernelWidthAndHeight
          },
          pixel: this.getAveragePixelValueWithinKernel(kernelWidthAndHeight, getPixelWithinKernel)
        });
      }
    }

    return scaledImage;
  }

  private getAveragePixelValueWithinKernel(kernelWidthAndHeight, getPixel) {
    let sum = 0;
    for (let y = 0; y < kernelWidthAndHeight; y++) {
      for (let x = 0; x < kernelWidthAndHeight; x++) {
        sum += getPixel(x, y);
      }
    }
    return Math.round(sum / (kernelWidthAndHeight ** 2));;
  }

  private getPixel({ image: { pixels, width }, point: { x, y } }) {
    return pixels[y * width + x];
  }

  private putPixel({ image: { pixels, width }, point: { x, y }, pixel }) {
    pixels[y * width + x] = pixel;
  }
}
