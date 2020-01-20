import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit, AfterViewInit {

  @Input() knnClassifier;

  @ViewChild('digitCanvasBig', { static: false }) public canvasBig: ElementRef<HTMLCanvasElement>;
  @ViewChild('digitCanvasSmall', { static: false }) public canvasSmall: ElementRef<HTMLCanvasElement>;

  private ctxBig: CanvasRenderingContext2D;

  lastMouse = { x: 0, y: 0 };
  mouse = { x: 0, y: 0 };
  isMousedown = false;

  constructor() { }

  ngOnInit() {
    console.log('knnClassifier:', this.knnClassifier);
  }

  ngAfterViewInit(): void {
    // FK-TODO: imageWidth und imageHeight aus datasetDescription.imageWidth und datasetDescription.imageHeight beziehen
    const imageWidth = 28;
    const imageHeight = 28;
    this.ctxBig = this.canvasBig.nativeElement.getContext('2d');
    this.canvasSmall.nativeElement.width = imageWidth;
    this.canvasSmall.nativeElement.height = imageHeight;

    this.initializeDrawTool();
    // (canvasBig, canvasSmall) => predictDrawnDigit(canvasBig, canvasSmall, tree, network, rowsClassifier, classifierType, imageWidth, imageHeight));
    // this.drawImageIntoCanvas();
  }

  private onDigitDrawn() {
    const rowsClassifier = this.getRowsClassifier(this.knnClassifier);
    this.predictDrawnDigit(rowsClassifier, imageWidth, imageHeight);
  }

  private getRowsClassifier(classifier) {
    // https://stackoverflow.com/questions/38482357/using-multiple-instances-of-the-same-service
    const cache = new Cache();

    return (rows, receivePredictionsForRows) => {
      const nonCachedRows = rows.filter(row => !cache.containsKey(row));
      classifier(
        nonCachedRows,
        nonCachedPredictions => {
          cache.cacheValuesForKeys({
            keys: nonCachedRows,
            values: nonCachedPredictions
          });
          const predictions = cache.getValuesForKeys({
            keys: rows
          });
          receivePredictionsForRows(predictions);
        });
    };
  }

  private predictDrawnDigit(rowsClassifier, classifierType, imageWidth, imageHeight) {
    const pixels = getPixels(canvasBig, canvasSmall);
    if (classifierType == ClassifierType.DECISION_TREE) {
      const prediction = predict(tree, pixels);
      highlightPredictionInNetwork(prediction, network);
      setPrediction(prediction.value);
    } else {
      rowsClassifier(
        [pixels],
        ([kNearestNeighborsWithPrediction]) => {
          setPrediction(kNearestNeighborsWithPrediction.prediction);
          displayDigitDataset(
            // FK-TODO: DRY: dieses Hinzufügen des y-Wertes wird an mehreren Stellen vorgenommen
            kNearestNeighborsWithPrediction.kNearestNeighbors.map(({ x, y }) => x.concat(y)),
            imageWidth,
            imageHeight,
            'container-k-nearest-digits');
        });
    }
  }

  prepareNewPrediction() {
    this.clearCanvases(this.canvasBig.nativeElement, this.canvasSmall.nativeElement);
    // document.querySelector('#container-k-nearest-digits').innerHTML = '';
    // setPrediction('');
  }

  private clearCanvases(canvasBig, canvasSmall) {
    this.clearCanvas(canvasBig);
    this.clearCanvas(canvasSmall);
  }

  private clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
  private initializeDrawTool() {
    this.ctxBig.globalAlpha = 1;
    this.ctxBig.globalCompositeOperation = 'source-over';
    this.ctxBig.strokeStyle = 'black';
    this.ctxBig.lineWidth = 20;
    this.ctxBig.lineJoin = this.ctxBig.lineCap = 'round';
  }

  mousedown(e) {
    this.lastMouse = this.mouse = this.getMousePos(this.canvasBig.nativeElement, e);
    this.isMousedown = true;
  }

  mousemove(e) {
    this.mouse = this.getMousePos(this.canvasBig.nativeElement, e);
    if (this.isMousedown) {
      this.ctxBig.beginPath();
      this.ctxBig.moveTo(this.lastMouse.x, this.lastMouse.y);
      this.ctxBig.lineTo(this.mouse.x, this.mouse.y);
      this.ctxBig.stroke();
    }
    this.lastMouse = this.mouse;
  }

  mouseup(e) {
    this.isMousedown = false;
    this.onDigitDrawn();
  }

  // taken from https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
  private getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect(); // abs. size of element
    const scaleX = canvas.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

    return {
      x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
    };
  }
}
