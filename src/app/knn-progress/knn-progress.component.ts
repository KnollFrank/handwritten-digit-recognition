import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-knn-progress',
  templateUrl: './knn-progress.component.html',
  styleUrls: ['./knn-progress.component.css']
})
export class KnnProgressComponent implements OnInit {

  @Input() numProgessElements;
  progress: { actualProgress: number; maxProgress: number; }[];

  constructor() { }

  ngOnInit() {
    this.progress = [];
    for (let i = 0; i < this.numProgessElements; i++) {
      this.progress.push({ actualProgress: 0, maxProgress: 0 });
    }
  }

  // FK-TODO: rename workerIndexZeroBased to progressElementIndexZeroBased
  setProgress({ workerIndexZeroBased, actualIndexZeroBased, endIndexZeroBasedExclusive }) {
    this.progress[workerIndexZeroBased].actualProgress = actualIndexZeroBased + 1;
    this.progress[workerIndexZeroBased].maxProgress = endIndexZeroBasedExclusive;
  }
}
