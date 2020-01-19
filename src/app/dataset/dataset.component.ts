import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ImageService } from '../image.service';

// FK-TODO: diese Funktionen in einem Service zur Verfügung stellen
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
  datasetDescription: any;

  constructor(private imageService: ImageService) { }

  ngOnInit() {
    this.kernelWidthAndHeight = 1;
  }

  toNumber() {
    this.kernelWidthAndHeight = +this.kernelWidthAndHeight;
  }

  setDatasetDescription(datasetDescription) {
    this.datasetDescription = datasetDescription;
    console.log('datasetDescription:', this.datasetDescription);
  }

  onSubmit() {
    this.onReceiveDatasetDescription.emit(this.getTransformedDatasetDescription());
  }

  private getTransformedDatasetDescription() {
    return this.datasetDescription.isDigitDataset() ?
      this.transform(this.datasetDescription, this.kernelWidthAndHeight) :
      this.datasetDescription;
  }

  private transform(datasetDescription, kernelWidthAndHeight) {
    const getScaledImageForRow = row => {
      const strings2Numbers = strings => strings.map(string => Number(string));

      return this.imageService.getScaledImage({
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
}
