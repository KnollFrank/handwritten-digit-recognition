import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit {

  @Input() knnClassifier;

  constructor() { }

  ngOnInit() {
    console.log('knnClassifier:', this.knnClassifier);
  }
}
