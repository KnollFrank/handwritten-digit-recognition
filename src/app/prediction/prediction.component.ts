import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CacheService } from '../cache.service';
import { ImageAlgosService } from '../image-algos.service';

declare var $: any;

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit, AfterViewInit {

  @Input() knnClassifier;

  @ViewChild('digitCanvasBig', { static: false }) public canvasBigRef: ElementRef<HTMLCanvasElement>;
  canvasBig: HTMLCanvasElement;

  @ViewChild('digitCanvasSmall', { static: false }) public canvasSmallRef: ElementRef<HTMLCanvasElement>;
  canvasSmall: HTMLCanvasElement;

  @ViewChild('digitCanvasBigResultOfPrediction', { static: false })
  public digitCanvasBigResultOfPredictionRef: ElementRef<HTMLCanvasElement>;
  digitCanvasBigResultOfPrediction: HTMLCanvasElement;

  private ctxBig: CanvasRenderingContext2D;

  // FK-TODO: imageWidth und imageHeight aus datasetDescription.imageWidth und datasetDescription.imageHeight beziehen
  imageWidth = 28;
  imageHeight = 28;

  lastMouse = { x: 0, y: 0 };
  mouse = { x: 0, y: 0 };
  isMousedown = false;

  constructor(private cache: CacheService, private imageAlgos: ImageAlgosService) { }

  ngOnInit() {
    console.log('knnClassifier:', this.knnClassifier);
  }

  ngAfterViewInit(): void {
    this.canvasBig = this.canvasBigRef.nativeElement;
    this.canvasSmall = this.canvasSmallRef.nativeElement;
    this.digitCanvasBigResultOfPrediction = this.digitCanvasBigResultOfPredictionRef.nativeElement;
    this.ctxBig = this.canvasBig.getContext('2d');
    this.canvasSmall.width = this.imageWidth;
    this.canvasSmall.height = this.imageHeight;

    this.initializeDrawTool();
    // (canvasBig, canvasSmall) => predictDrawnDigit(canvasBig, canvasSmall, tree, network, rowsClassifier, classifierType, imageWidth, imageHeight));
    // this.drawImageIntoCanvas();
  }

  private onDigitDrawn() {
    const rowsClassifier = this.getRowsClassifier(this.knnClassifier);
    this.predictDrawnDigit(rowsClassifier, this.imageWidth, this.imageHeight);
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
    };
  }

  private predictDrawnDigit(rowsClassifier, imageWidth, imageHeight) {
    const pixels = this.getPixels();
    rowsClassifier(
      [pixels],
      ([kNearestNeighborsWithPrediction]) => {
        this.setPrediction(kNearestNeighborsWithPrediction.prediction);
        console.log('prediction:', kNearestNeighborsWithPrediction.prediction);
        /*displayDigitDataset(
          // FK-TODO: DRY: dieses Hinzufügen des y-Wertes wird an mehreren Stellen vorgenommen
          kNearestNeighborsWithPrediction.kNearestNeighbors.map(({ x, y }) => x.concat(y)),
          imageWidth,
          imageHeight,
          'container-k-nearest-digits');*/
      });
  }

  private setPrediction(predictedValue) {
    this.clearCanvas(this.digitCanvasBigResultOfPrediction);
    this.printCenteredTextIntoCanvas(this.digitCanvasBigResultOfPrediction, predictedValue);
  }

  private printCenteredTextIntoCanvas(canvas, text) {
    const ctx = canvas.getContext('2d');
    const fontSize = Math.min(canvas.width, canvas.height);
    ctx.font = `${fontSize}px Verdana`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  private prepareNewPrediction() {
    this.clearCanvases();
    // document.querySelector('#container-k-nearest-digits').innerHTML = '';
    // setPrediction('');
  }

  private clearCanvases() {
    this.clearCanvas(this.canvasBig);
    this.clearCanvas(this.canvasSmall);
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
    this.lastMouse = this.mouse = this.getMousePos(this.canvasBig, e);
    this.isMousedown = true;
  }

  mousemove(e) {
    this.mouse = this.getMousePos(this.canvasBig, e);
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

  private getPixels() {
    this.fitSrc2Dst({ srcCanvas: this.canvasBig, dstCanvas: this.canvasSmall });
    const ctxSmall = this.canvasSmall.getContext('2d');
    const imageData = ctxSmall.getImageData(0, 0, this.canvasSmall.width, this.canvasSmall.height);
    return imageData2Pixels(imageData);
  }

  private fitSrc2Dst({ srcCanvas, dstCanvas }) {
    const imageData =
      srcCanvas
        .getContext('2d')
        .getImageData(0, 0, srcCanvas.width, srcCanvas.height);

    const center = this.getCenterOfMassOfImageOrDefault({
      imageData,
      default: { x: srcCanvas.width / 2, y: srcCanvas.height / 2 }
    });

    const newCanvas = $('<canvas>')
      .attr('width', imageData.width)
      .attr('height', imageData.height)[0];

    newCanvas.getContext('2d').putImageData(
      imageData, -(center.x - srcCanvas.width / 2), -(center.y - srcCanvas.height / 2));

    // FK-TODO: refactor
    const originalImageWidthAndHeight = 28;
    const originalBoundingBoxWidthAndHeight = 20;
    const kernelWidthAndHeight = originalImageWidthAndHeight / dstCanvas.width;
    const boundingBoxWidthAndHeight = originalBoundingBoxWidthAndHeight / kernelWidthAndHeight;
    this.drawScaledAndCenteredImageOntoCanvas({
      canvas: dstCanvas,
      image: newCanvas,
      newImageWidthAndHeight: boundingBoxWidthAndHeight
    });
  }

  private getCenterOfMassOfImageOrDefault({ imageData, default: defaultValue }) {
    const centerOfMass = this.imageAlgos.getCenterOfMass({
      pixels: imageData2Pixels(imageData),
      width: imageData.width,
      height: imageData.height
    });
    return centerOfMass || defaultValue;
  }

  private drawScaledAndCenteredImageOntoCanvas({ canvas, image, newImageWidthAndHeight }) {
    this.clearCanvas(canvas);
    canvas.getContext('2d').drawImage(
      image,
      (canvas.width - newImageWidthAndHeight) / 2,
      (canvas.height - newImageWidthAndHeight) / 2,
      newImageWidthAndHeight,
      newImageWidthAndHeight);
  }
}

function imageData2Pixels(imageData) {
  const pixels = [];
  for (const it of iterateOverImageData(imageData)) {
    pixels.push(imageData.data[it.color_index.alpha]);
  }
  return pixels;
}

function* iterateOverImageData(imageData) {
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const i = getArrayIndexOfPoint({ x, y }, imageData.width);
      yield {
        x,
        y,
        pixelIndex: i,
        color_index: {
          red: i * 4 + 0,
          green: i * 4 + 1,
          blue: i * 4 + 2,
          alpha: i * 4 + 3
        }
      };
    }
  }
}

function getArrayIndexOfPoint(point, width) {
  return point.y * width + point.x;
}
