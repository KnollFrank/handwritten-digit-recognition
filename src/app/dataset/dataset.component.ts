import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ImageService } from '../image.service';
import { FormBuilder } from '@angular/forms';
import { getClassValFromRow, getIndependentValsFromRow } from './datasetHelper';


@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {

  @Output() onReceiveDatasetDescription = new EventEmitter();

  datasetForm = this.fb.group({
    kernelWidthAndHeight: ['1']
  });

  datasetDescription: any;

  constructor(private imageService: ImageService, private fb: FormBuilder) { }

  ngOnInit() {
  }

  setDatasetDescription(datasetDescription) {
    this.datasetDescription = datasetDescription;
  }

  onSubmit() {
    this.onReceiveDatasetDescription.emit(this.getTransformedDatasetDescription());
  }

  private getTransformedDatasetDescription() {
    return this.datasetDescription.isDigitDataset() ?
      this.transform(this.datasetDescription, this.datasetForm.value.kernelWidthAndHeight) :
      this.datasetDescription;
  }

  private transform(datasetDescription, kernelWidthAndHeight) {
    const getScaledImageForRow = row => {
      const strings2Numbers = strs => strs.map(str => Number(str));

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
    const someTransformedImage = getScaledImageForRow(datasetDescription.splittedDataset.train[0]);

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
      kernelWidthAndHeight: Number(kernelWidthAndHeight),
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
