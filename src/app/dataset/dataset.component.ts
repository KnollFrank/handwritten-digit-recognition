import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onReceiveDatasetDescription(datasetDescription) {
    console.log('datasetDescription:', datasetDescription);
  }
}
