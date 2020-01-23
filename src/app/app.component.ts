import { Component, OnInit } from '@angular/core';
import { CacheService } from './cache.service';
import { AccuracyCalculatorService } from './accuracy-calculator.service';

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
            image
          }));
  }

  onReceiveKnnClassifier(knnClassifier) {
    console.log('onReceiveKnnClassifier:', knnClassifier);
    this.knnClassifier = knnClassifier;
  }

  get totalNumberOfDigits() {
    return this.datasetDescription.splittedDataset.train.length;
  }

  get firstNDigits2Display() {
    return Math.min(this.maxDigits2Display, this.totalNumberOfDigits);
  }

  computeAccuracy() {
    this.accuracyCalculatorService.computeAccuracy(
      this.getRowsClassifier(this.knnClassifier),
      this.datasetDescription,
      this.datasetDescription.splittedDataset.test,
      accuracy => {
        this.accuracy = accuracy;
        console.log(`Accuracy: ${Math.floor(accuracy)}%`);
        this.digitTestDataset =
          this.datasetDescription.splittedDataset.test
            .slice(0, this.maxDigits2Display)
            .map(
              image => ({
                width: this.datasetDescription.imageWidth,
                height: this.datasetDescription.imageHeight,
                figcaption: getClassValFromRow(image),
                image
              }));
      });
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
