import { Component, OnInit } from '@angular/core';
import { CacheService } from './cache.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular';
  datasetDescription: any;
  maxDigits2Display: number = 500;
  totalNumberOfDigits: number;
  firstNDigits2Display: number;

  constructor(private cache: CacheService) {
  }

  ngOnInit(): void {
    console.log(this.cache.get('someKey', () => Math.floor(Math.random() * 100)));
    console.log(this.cache.get('someKey', () => Math.floor(Math.random() * 100)));
  }

  onReceiveDatasetDescription(datasetDescription) {
    console.log('app: datasetDescription:', datasetDescription);
    this.datasetDescription = datasetDescription;
    this.totalNumberOfDigits = this.datasetDescription.splittedDataset.train.length;
    this.firstNDigits2Display = Math.min(this.maxDigits2Display, this.totalNumberOfDigits);
  }
}
