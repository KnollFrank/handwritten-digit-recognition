import { Component, OnInit, Input } from '@angular/core';

declare var getClassValFromRow: any;

@Component({
  selector: 'app-digits',
  templateUrl: './digits.component.html',
  styleUrls: ['./digits.component.css']
})
export class DigitsComponent implements OnInit {

  @Input('datasetDescription') datasetDescription;
  @Input('maxDigits2Display') maxDigits2Display;

  digitDataset;

  constructor() { }

  ngOnInit() {
    this.digitDataset =
      this.datasetDescription.splittedDataset.train
        .slice(0, this.maxDigits2Display)
        .map(
          image => ({
            width: this.datasetDescription.imageWidth,
            height: this.datasetDescription.imageHeight,
            figcaption: getClassValFromRow(image),
            image: image
          }));
  }
}
