import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var Papa: any;

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.css']
})
export class FilePickerComponent implements OnInit {

  @Output() onReceiveDatasetDescription = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  public readAndSubmitCSVFile(dataFile) {
    Papa.parse(dataFile, {
      download: true,
      header: false,
      complete: results => {
        const datasetDescription = this.getDatasetDescription(dataFile.name, results.data);
        this.onReceiveDatasetDescription.emit(datasetDescription);
      }
    });
  }

  private getDatasetDescription(fileName, dataset) {
    const attributeNames = dataset[0];
    // remove header (= column names) of dataset
    dataset.splice(0, 1);
    const datasetDescription = {
      fileName,
      attributeNames: {
        X: attributeNames.slice(0, -1),
        y: attributeNames[attributeNames.length - 1],
        all: attributeNames
      },
      splittedDataset: this.train_test_split(dataset, 0.8),
      imageWidth: 28,
      imageHeight: 28
    };

    return datasetDescription;
  }

  private train_test_split(dataset, trainProportion) {
    const end = trainProportion * dataset.length;
    return {
      train: dataset.slice(0, end),
      test: dataset.slice(end)
    };
  }
}
