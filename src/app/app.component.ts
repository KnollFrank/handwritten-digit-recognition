import { Component, OnInit } from '@angular/core';
import { CacheService } from './cache.service';
import { AccuracyCalculatorService } from './accuracy-calculator.service';

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

  constructor(private cache: CacheService, private accuracyCalculatorService: AccuracyCalculatorService) {
  }

  ngOnInit(): void {
  }

  onReceiveDatasetDescription(datasetDescription) {
    this.datasetDescription = datasetDescription;
    this.digitTrainDataset =
      this.datasetDescription.splittedDataset.train
        .slice(0, this.maxDigits2Display)
        .map(image => this.createImageDescription({ image: image, classList: [] }));
  }

  private createImageDescription({ image, classList }) {
    return ({
      width: this.datasetDescription.imageWidth,
      height: this.datasetDescription.imageHeight,
      figcaption: getClassValFromRow(image),
      image,
      classList
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
    const rowsClassifier = this.getRowsClassifier(this.knnClassifier);
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
      classList: this.getClassListOfFigcaption(
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

  // FK-TODO: getRowsClassifier() umbenennen in getCachingRowsClassifier() + extract method
  private getRowsClassifier(classifier) {
    // FK-TODO: bei jedem Aufruf der Methode getRowsClassifier() soll ein neuer, leerer Cache verwendet werden.
    return (rows, receivePredictionsForRows) => {
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
        });
    }
  }
}
