import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ImageService } from '../image.service';
import { FormBuilder } from '@angular/forms';
import { getClassValFromRow, getIndependentValsFromRow } from './datasetHelper';
import { DatasetDescriptionReader } from './datasetDescriptionReader';


@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit, AfterViewInit {

  min = 0;
  get max() {
    return this.datasetDescription ? this.datasetDescription.splittedDataset.train.length : 0;
  }

  @Output() transformedDatasetDescription = new EventEmitter();
  datasetDescription: any;

  datasetForm = this.fb.group({
    kernelWidthAndHeight: ['2'],
    numDigits: [5000]
  });

  constructor(private imageService: ImageService, private fb: FormBuilder) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    new DatasetDescriptionReader().readDatasetDescription(
      datasetDescription => this.datasetDescription = datasetDescription);
  }

  onSubmit() {
    this.transformedDatasetDescription.emit(this.getTransformedDatasetDescription());
  }

  private getTransformedDatasetDescription() {
    return this.getScaledDatasetDescription(
      this.getTrainSlicedDatasetDescription(
        this.datasetDescription,
        this.datasetForm.value.numDigits),
      this.datasetForm.value.kernelWidthAndHeight);
  }

  private getTrainSlicedDatasetDescription(datasetDescription, numDigits) {
    return {
      ...datasetDescription,
      splittedDataset: this.getTrainSlicedSplittedDataset(datasetDescription.splittedDataset, numDigits)
    };
  }

  private getTrainSlicedSplittedDataset(splittedDataset, numDigits: number) {
    return {
      ...splittedDataset,
      train: splittedDataset.train.slice(0, numDigits)
    };
  }

  private getScaledDatasetDescription(datasetDescription, kernelWidthAndHeight) {
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

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }
}
