import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ImageAlgosService } from '../image-algos.service';
import { CanvasImageService } from '../canvas-image.service';
import { Point } from '../point';

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

  private imageWidth: number;
  private imageHeight: number;

  digitDataset: any;
  src2DstFitter: Src2DstFitter;
  src2DstFitterUsingBoundingBox: Src2DstFitterUsingBoundingBox;

  constructor(
    private imageAlgosService: ImageAlgosService,
    private canvasImageService: CanvasImageService) {
    this.src2DstFitter = new Src2DstFitter(imageAlgosService, canvasImageService);
    this.src2DstFitterUsingBoundingBox = new Src2DstFitterUsingBoundingBox(imageAlgosService, canvasImageService);
  }

  ngOnInit() {
    this.digitClassifier = this.getDigitClassifier(this.knnClassifier);
    this.imageWidth = this.datasetDescription.imageWidth;
    this.imageHeight = this.datasetDescription.imageHeight;
  }

  ngAfterViewInit(): void {
    this.canvasSmall = this.canvasSmallRef.nativeElement;
    this.digitCanvasBigResultOfPrediction = this.digitCanvasBigResultOfPredictionRef.nativeElement;
    this.canvasSmall.width = this.imageWidth;
    this.canvasSmall.height = this.imageHeight;
  }

  private getDigitClassifier(classifier) {
    return (digit, receivePredictionsForDigit) =>
      classifier({
        rows: [digit],
        receivePredictionsForRows: kNearestNeighborsWithPredictions => receivePredictionsForDigit(kNearestNeighborsWithPredictions[0])
      });
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
    this.canvasImageService.clearCanvas(this.digitCanvasBigResultOfPrediction);
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
    this.canvasImageService.clearCanvas(this.canvasSmall);
  }

  private getPixels(digitImageData) {
    this.src2DstFitterUsingBoundingBox.fitSrc2Dst({ srcImageData: digitImageData, dstCanvas: this.canvasSmall });
    // this.src2DstFitter.fitSrc2Dst({ srcImageData: digitImageData, dstCanvas: this.canvasSmall });
    const ctxSmall = this.canvasSmall.getContext('2d');
    const imageData = ctxSmall.getImageData(0, 0, this.canvasSmall.width, this.canvasSmall.height);
    return this.canvasImageService.imageData2Pixels(imageData);
  }
}

class Src2DstFitter {

  constructor(
    private imageAlgosService: ImageAlgosService,
    private canvasImageService: CanvasImageService) {

  }

  public fitSrc2Dst({ srcImageData, dstCanvas }) {
    // FK-TODO: refactor
    const originalImageWidthAndHeight = 28;
    const originalBoundingBoxWidthAndHeight = 20;
    const kernelWidthAndHeight = originalImageWidthAndHeight / dstCanvas.width;
    const boundingBoxWidthAndHeight = originalBoundingBoxWidthAndHeight / kernelWidthAndHeight;
    this.drawScaledAndCenteredImageOntoCanvas({
      image: this.createCanvasWithCenteredImageData(srcImageData),
      canvas: dstCanvas,
      newImageWidthAndHeight: boundingBoxWidthAndHeight
    });
  }

  private drawScaledAndCenteredImageOntoCanvas({ image, canvas, newImageWidthAndHeight }) {
    this.canvasImageService.clearCanvas(canvas);
    canvas.getContext('2d').drawImage(
      image,
      (canvas.width - newImageWidthAndHeight) / 2,
      (canvas.height - newImageWidthAndHeight) / 2,
      newImageWidthAndHeight,
      newImageWidthAndHeight);
  }

  private createCanvasWithCenteredImageData(imageData) {
    const canvas = this.canvasImageService.createCanvas({ width: imageData.width, height: imageData.height });
    this.drawCenteredImageDataIntoCanvas(
      {
        centerOfImageData: this.getCenterOfMassOfImageOrDefault(
          {
            imageData,
            default: this.getCenter(imageData)
          }),
        imageData,
        canvas
      });
    return canvas;
  }

  private drawCenteredImageDataIntoCanvas({ centerOfImageData, imageData, canvas }) {
    const topLeftPoint = this.getCenter(imageData).sub(centerOfImageData);
    canvas.getContext('2d').putImageData(imageData, topLeftPoint.x, topLeftPoint.y);
  }

  private getCenterOfMassOfImageOrDefault({ imageData, default: defaultValue }) {
    const centerOfMass = this.imageAlgosService.getCenterOfMass(this.canvasImageService.createImage(imageData));
    return centerOfMass || defaultValue;
  }

  private getCenter(imageData: any): Point {
    return new Point(imageData.width, imageData.height).mul(0.5);
  }
}

class Src2DstFitterUsingBoundingBox {

  constructor(
    private imageAlgosService: ImageAlgosService,
    private canvasImageService: CanvasImageService) {

  }

  public fitSrc2Dst({ srcImageData, dstCanvas }) {
    // FK-TODO: refactor
    const originalImageWidthAndHeight = 28;
    const originalBoundingBoxWidthAndHeight = 20;
    const kernelWidthAndHeight = originalImageWidthAndHeight / dstCanvas.width;
    const boundingBoxWidthAndHeight = originalBoundingBoxWidthAndHeight / kernelWidthAndHeight;

    const boundingBox =
      this.imageAlgosService.getQuadraticBoundingBox(
        this.canvasImageService.createImage(srcImageData));

    const canvas = this.canvasImageService.createCanvas(srcImageData);
    canvas.getContext('2d').putImageData(srcImageData, 0, 0);
    this.drawScaledAndCenteredImageOntoCanvasBB({
      image: canvas,
      boundingBox,
      canvas: dstCanvas,
      newImageWidthAndHeight: boundingBoxWidthAndHeight
    });
  }

  private drawScaledAndCenteredImageOntoCanvasBB({ image, boundingBox, canvas, newImageWidthAndHeight }) {
    this.canvasImageService.clearCanvas(canvas);
    const { upperLeftCorner, lowerRightCorner } = boundingBox;
    const sx = upperLeftCorner.x;
    const sy = upperLeftCorner.y;
    const sWidth = lowerRightCorner.x - upperLeftCorner.x;
    const sHeight = lowerRightCorner.y - upperLeftCorner.y;
    const dWidth = newImageWidthAndHeight;
    const dHeight = newImageWidthAndHeight;
    const dx = (canvas.width - dWidth) / 2;
    const dy = (canvas.height - dHeight) / 2;
    canvas.getContext('2d').drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
}