import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var Papa: any;

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.css']
})
export class FilePickerComponent implements OnInit {

  @Output() datasetDescription = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  public readAndSubmitCSVFile(csvFile) {
    this.readCSVFiles(
      '../../assets/mnist_train_500.csv',
      '../../assets/mnist_test_5000.csv',
      (trainDataset, testDataset) => {
        const datasetDescription = this.getDatasetDescription(trainDataset, testDataset);
        this.datasetDescription.emit(datasetDescription);
      });
  }

  private readCSVFiles(csvFile1, csvFile2, onReceiveDatasets) {
    this.readCSVFile(csvFile1, dataset1 =>
      this.readCSVFile(csvFile2, dataset2 =>
        onReceiveDatasets(dataset1, dataset2)));
  }

  private readCSVFile(csvFile, onReceiveFileContents) {
    Papa.parse(
      csvFile,
      {
        download: true,
        header: false,
        complete: results => onReceiveFileContents(results.data)
      });
  }

  private getDatasetDescription(trainDataset, testDataset) {
    const attributeNames = this.getHeaderFrom(trainDataset);
    this.removeHeaderFrom(trainDataset);
    this.removeHeaderFrom(testDataset);
    const datasetDescription = {
      attributeNames: {
        X: attributeNames.slice(0, -1),
        y: attributeNames[attributeNames.length - 1],
        all: attributeNames
      },
      splittedDataset: { train: trainDataset, test: testDataset },
      imageWidth: 28,
      imageHeight: 28
    };

    return datasetDescription;
  }

  private headerIndex = 0;

  private getHeaderFrom(dataset: any) {
    return dataset[this.headerIndex];
  }

  // remove header (= column names) from dataset
  private removeHeaderFrom(dataset: any) {
    dataset.splice(this.headerIndex, 1);
  }
}
