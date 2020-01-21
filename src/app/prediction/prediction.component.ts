import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ImageAlgosService } from '../image-algos.service';

declare var $: any;

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit, AfterViewInit {

  @Input() knnClassifier;
  digitClassifier: (digit: any, receivePredictionsForDigit: any) => any;

  @Input() datasetDescription;

  @ViewChild('digitCanvasSmall', { static: false }) public canvasSmallRef: ElementRef<HTMLCanvasElement>;
  canvasSmall: HTMLCanvasElement;

  @ViewChild('freeHandDrawingTool', { static: false }) public freeHandDrawingTool;

  @ViewChild('digitCanvasBigResultOfPrediction', { static: false })
  public digitCanvasBigResultOfPredictionRef: ElementRef<HTMLCanvasElement>;
  digitCanvasBigResultOfPrediction: HTMLCanvasElement;

  // FK-TODO: imageWidth und imageHeight aus datasetDescription.imageWidth und datasetDescription.imageHeight beziehen
  imageWidth = 28;
  imageHeight = 28;

  digitDataset: any;

  constructor(private imageAlgos: ImageAlgosService) { }

  ngOnInit() {
    this.digitClassifier = this.getDigitClassifier(this.knnClassifier);
  }

  ngAfterViewInit(): void {
    this.canvasSmall = this.canvasSmallRef.nativeElement;
    this.digitCanvasBigResultOfPrediction = this.digitCanvasBigResultOfPredictionRef.nativeElement;
    this.canvasSmall.width = this.imageWidth;
    this.canvasSmall.height = this.imageHeight;
  }

  private getDigitClassifier(classifier) {
    return (digit, receivePredictionsForDigit) =>
      classifier(
        [digit],
        kNearestNeighborsWithPredictions => receivePredictionsForDigit(kNearestNeighborsWithPredictions[0]));
  }

  private predictDrawnDigit(digitImageData) {
    this.digitClassifier(
      this.getPixels(digitImageData),
      kNearestNeighborsWithPrediction => {
        this.setPrediction(kNearestNeighborsWithPrediction.prediction);
        this.digitDataset =
          kNearestNeighborsWithPrediction.kNearestNeighbors.map(({ x, y }) =>
            ({
              width: this.imageWidth,
              height: this.imageHeight,
              figcaption: y,
              image: x.concat(y)
            }));
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
    this.digitDataset = [];
    this.setPrediction('');
  }

  private clearCanvases() {
    this.freeHandDrawingTool.clearCanvas();
    this.clearCanvas(this.canvasSmall);
  }

  private clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  private getPixels(digitImageData) {
    this.fitSrc2Dst({ srcImageData: digitImageData, dstCanvas: this.canvasSmall });
    const ctxSmall = this.canvasSmall.getContext('2d');
    const imageData = ctxSmall.getImageData(0, 0, this.canvasSmall.width, this.canvasSmall.height);
    return imageData2Pixels(imageData);
  }

  private fitSrc2Dst({ srcImageData, dstCanvas }) {
    const center = this.getCenterOfMassOfImageOrDefault({
      imageData: srcImageData,
      default: { x: srcImageData.width / 2, y: srcImageData.height / 2 }
    });

    const newCanvas = $('<canvas>')
      .attr('width', srcImageData.width)
      .attr('height', srcImageData.height)[0];

    newCanvas.getContext('2d').putImageData(
      srcImageData, -(center.x - srcImageData.width / 2), -(center.y - srcImageData.height / 2));

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
