import { Component, OnInit } from '@angular/core';
import { CacheService } from './cache.service';

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
  digitDataset: any;

  constructor(private cache: CacheService) {
  }

  ngOnInit(): void {
    console.log(this.cache.get('someKey', () => Math.floor(Math.random() * 100)));
    console.log(this.cache.get('someKey', () => Math.floor(Math.random() * 100)));
  }

  onReceiveDatasetDescription(datasetDescription) {
    console.log('app: datasetDescription:', datasetDescription);
    this.datasetDescription = datasetDescription;
    this.digitDataset =
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
}
