import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ImageService } from '../image.service';
import { FormBuilder } from '@angular/forms';
import { getClassValFromRow, getIndependentValsFromRow } from './datasetHelper';
import { DatasetDescriptionReader } from './datasetDescriptionReader';


@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {

  @Output() scaledDatasetDescription = new EventEmitter();

  datasetForm = this.fb.group({
    kernelWidthAndHeight: ['1']
  });

  constructor(private imageService: ImageService, private fb: FormBuilder) { }

  ngOnInit() {
  }

  onSubmit() {
    new DatasetDescriptionReader().readDatasetDescription(
      datasetDescription =>
        this.scaledDatasetDescription.emit(
          this.getScaledDatasetDescription(datasetDescription))
    );
  }

  private getScaledDatasetDescription(datasetDescription) {
    return this.scale(datasetDescription, this.datasetForm.value.kernelWidthAndHeight);
  }

  private scale(datasetDescription, kernelWidthAndHeight) {
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

    const scale = row => getScaledImageForRow(row).pixels.concat(getClassValFromRow(row));
    const someScaledImage = getScaledImageForRow(datasetDescription.splittedDataset.train[0]);

    const scaledDatasetDescription = {
      attributeNames: {
        X: this.createRowColLabels(someScaledImage.height, someScaledImage.width),
        y: datasetDescription.attributeNames.y,
        get all() {
          return this.X.concat(this.y);
        }
      },
      splittedDataset: {
        train: datasetDescription.splittedDataset.train.map(scale),
        test: datasetDescription.splittedDataset.test.map(scale)
      },
      kernelWidthAndHeight: Number(kernelWidthAndHeight),
      imageWidth: someScaledImage.width,
      imageHeight: someScaledImage.height
    };

    return scaledDatasetDescription;
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
