import { Component, OnInit } from '@angular/core';
import { CacheService } from './cache.service';
import { AccuracyCalculatorService } from './accuracy-calculator.service';

declare var getIndependentValsFromRow: any;
declare var getClassValFromRow: any;

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
    console.log(this.cache.get('someKey', () => Math.floor(Math.random() * 100)));
    console.log(this.cache.get('someKey', () => Math.floor(Math.random() * 100)));
  }

  onReceiveDatasetDescription(datasetDescription) {
    console.log('app: datasetDescription:', datasetDescription);
    this.datasetDescription = datasetDescription;
    this.digitTrainDataset =
      this.datasetDescription.splittedDataset.train
        .slice(0, this.maxDigits2Display)
        .map(
          image => ({
            width: this.datasetDescription.imageWidth,
            height: this.datasetDescription.imageHeight,
            figcaption: getClassValFromRow(image),
            image,
            classList: []
          }));
  }

  onReceiveKnnClassifier(knnClassifier) {
    console.log('onReceiveKnnClassifier:', knnClassifier);
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
        rowsClassifier(
          this.datasetDescription.splittedDataset.test.map(row => getIndependentValsFromRow(row, this.datasetDescription)),
          kNearestNeighborssWithPredictions => {
            const predictions = this.getPredictions(kNearestNeighborssWithPredictions);
            this.digitTestDataset =
              this.datasetDescription.splittedDataset.test
                .slice(0, this.maxDigits2Display)
                .map(
                  (image, i) => ({
                    width: this.datasetDescription.imageWidth,
                    height: this.datasetDescription.imageHeight,
                    figcaption: getClassValFromRow(image),
                    image,
                    classList: predictions[i] == getClassValFromRow(image) ? [] : ['wrongPrediction']
                  }));
          });
      });
  }

  private getPredictions(kNearestNeighborssWithPredictions) {
    return kNearestNeighborssWithPredictions.map(({ prediction }) => prediction);
  }

  private getRowsClassifier(classifier) {
    return (rows, receivePredictionsForRows) => {
      const nonCachedRows = rows.filter(row => !this.cache.containsKey(row));
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
