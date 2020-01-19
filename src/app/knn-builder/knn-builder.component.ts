import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-knn-builder',
  templateUrl: './knn-builder.component.html',
  styleUrls: ['./knn-builder.component.css']
})
export class KnnBuilderComponent implements OnInit {

  k: number = 3;

  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    console.log('knn, k:', this.k);
    // this.onReceiveDatasetDescription.emit(this.getTransformedDatasetDescription());
  }
}
