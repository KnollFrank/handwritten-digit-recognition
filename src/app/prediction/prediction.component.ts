import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit, AfterViewInit {

  @Input() knnClassifier;

  @ViewChild('digitCanvasBig', { static: false }) public canvasBig: ElementRef<HTMLCanvasElement>;

  private ctxBig: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit() {
    console.log('knnClassifier:', this.knnClassifier);
  }

  ngAfterViewInit(): void {
    this.ctxBig = this.canvasBig.nativeElement.getContext('2d');
    // this.drawImageIntoCanvas();
  }

  mousedown(e) {
    console.log(e.type);
  }

  mousemove(e) {
    console.log(e.type);
  }

  mouseup(e) {
    console.log(e.type);
  }
}
