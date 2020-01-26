import { Component, OnInit, ViewChild } from '@angular/core';
import { CacheService } from './cache.service';
import { AccuracyCalculatorService } from './accuracy-calculator.service';
import { KnnProgressComponent } from './knn-progress/knn-progress.component';

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

  @ViewChild(KnnProgressComponent, { static: false }) knnProgressComponent: KnnProgressComponent;

  constructor(private cache: CacheService, private accuracyCalculatorService: AccuracyCalculatorService) {
  }

  ngOnInit(): void {
    this.numWorkers = window.navigator.hardwareConcurrency;
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
    const rowsClassifier = this.getCachingRowsClassifier(this.knnClassifier);
    // FK-TODO: extract method
    const classifier = (rows, receivePredictionsForRows) =>
      rowsClassifier(
        rows,
        receivePredictionsForRows,
        (workerIndex, actualIndexZeroBased, endIndexZeroBasedExclusive) =>
          this.knnProgressComponent.setProgress({ progressElementIndexZeroBased: workerIndex, actualIndexZeroBased, endIndexZeroBasedExclusive }));
    this.accuracyCalculatorService.computeAccuracy(
      classifier,
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

  // FK-TODO: extract method
  private getCachingRowsClassifier(classifier) {
    // FK-TODO: bei jedem Aufruf der Methode getRowsClassifier() soll ein neuer, leerer Cache verwendet werden.
    return (rows, receivePredictionsForRows, receiveKnnProgress) => {
      const nonCachedRows = rows.filter(row => !this.cache.containsKey(row));
      console.log(`classifying nonCachedRows/rows: ${nonCachedRows.length}/${rows.length}`);
      classifier(
        nonCachedRows,
        nonCachedPredictions => {
          this.cache.cacheValuesForKeys({
            keys: nonCachedRows,
            values: nonCachedPredictions
          });
          const predictions = this.cache.getValuesForKeys({
            keys: rows
          });
          receivePredictionsForRows(predictions);
        },
        receiveKnnProgress);
    }
  }
}
