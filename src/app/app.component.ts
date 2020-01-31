import { Component, OnInit, ViewChild } from '@angular/core';
import { AccuracyCalculatorService } from './accuracy-calculator.service';
import { KnnProgressComponent } from './knn-progress/knn-progress.component';
import { environment } from 'src/environments/environment';
import { KnnBuilderComponent } from './knn-builder/knn-builder.component';

declare var getIndependentValsFromRow: any;
declare var getClassValFromRow: any;
declare var zip: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'angular';
  datasetDescription: any;
  maxDigits2Display = 500;
  knnClassifier: any;
  digitTrainDataset: any;
  digitTestDataset: any;
  accuracy: number;
  numWorkers: number;
  testdataEvaluated = false;

  @ViewChild(KnnProgressComponent, { static: false }) knnProgressComponent: KnnProgressComponent;

  @ViewChild(KnnBuilderComponent, { static: false }) knnBuilder: KnnBuilderComponent;

  constructor(private accuracyCalculatorService: AccuracyCalculatorService) {
  }

  ngOnInit(): void {
    this.numWorkers = environment.maxNumWorkers;
  }

  onReceiveDatasetDescription(datasetDescription) {
    this.datasetDescription = datasetDescription;
    this.digitTrainDataset =
      this.datasetDescription.splittedDataset.train
        .slice(0, this.maxDigits2Display)
        .map(image => this.createImageDescription(
          {
            image: image,
            figcaption: getClassValFromRow(image),
            classListOfFigcaption: []
          }));
    this.reset();
  }

  private reset() {
    this.knnClassifier = null;
    this.accuracy = null;
    this.testdataEvaluated = false;
    this.digitTestDataset = null;
  }

  private createImageDescription({ image, figcaption, classListOfFigcaption }) {
    return ({
      width: this.datasetDescription.imageWidth,
      height: this.datasetDescription.imageHeight,
      figcaption,
      image,
      classListOfFigcaption
    });
  }

  onReceiveKnnClassifier(knnClassifier) {
    this.knnClassifier = knnClassifier;
  }

  get totalNumberOfTrainDigits() {
    return this.datasetDescription.splittedDataset.train.length;
  }

  get firstNTrainDigits2Display() {
    return Math.min(this.maxDigits2Display, this.totalNumberOfTrainDigits);
  }

  get totalNumberOfTestDigits() {
    return this.datasetDescription.splittedDataset.test.length;
  }

  get firstNTestDigits2Display() {
    return Math.min(this.maxDigits2Display, this.totalNumberOfTestDigits);
  }

  computeAccuracy() {
    const rowsClassifier = this.getCachingAndProgressDisplayingRowsClassifier();
    this.accuracyCalculatorService.computeAccuracy(
      rowsClassifier,
      this.datasetDescription,
      this.datasetDescription.splittedDataset.test,
      accuracy => {
        this.accuracy = accuracy;
        console.log(`Accuracy: ${Math.floor(accuracy)}%`);
        this.displayTestDataset({
          rowsClassifier,
          testDataset: this.datasetDescription.splittedDataset.test.slice(0, this.maxDigits2Display)
        });
      });
  }

  private getCachingAndProgressDisplayingRowsClassifier() {
    const cachingRowsClassifier = this.knnBuilder.getCachingRowsClassifier(this.knnClassifier);
    return (rows, receivePredictionsForRows) =>
      cachingRowsClassifier(
        {
          rows,
          receivePredictionsForRows: predictions => {
            this.testdataEvaluated = true;
            receivePredictionsForRows(predictions);
          },
          receiveKnnProgress: ({ workerIndex, actualIndexZeroBased, endIndexZeroBasedExclusive }) =>
            this.knnProgressComponent.setProgress(
              {
                progressElementIndexZeroBased: workerIndex,
                actualIndexZeroBased,
                endIndexZeroBasedExclusive
              })
        });
  }

  private displayTestDataset({ rowsClassifier, testDataset }) {
    rowsClassifier(
      testDataset.map(row => getIndependentValsFromRow(row, this.datasetDescription)),
      kNearestNeighborssWithPredictions =>
        this.digitTestDataset = this.getDigitTestDataset(testDataset, this.getPredictions(kNearestNeighborssWithPredictions))
    );
  }

  private getDigitTestDataset(testDataset, predictions) {
    return zip(testDataset, predictions)
      .map(([image, prediction]) => this.getImageDescription({ image, prediction }));
  }

  private getImageDescription({ image, prediction }) {
    return this.createImageDescription({
      image: image,
      figcaption: prediction,
      classListOfFigcaption: this.getClassListOfFigcaption(
        {
          predictedClassVal: prediction,
          actualClassVal: getClassValFromRow(image)
        })
    });
  }

  private getClassListOfFigcaption({ predictedClassVal, actualClassVal }) {
    return predictedClassVal == actualClassVal ? [] : ['wrongPrediction'];
  }

  private getPredictions(kNearestNeighborssWithPredictions) {
    return kNearestNeighborssWithPredictions.map(({ prediction }) => prediction);
  }
}
