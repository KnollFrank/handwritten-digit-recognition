import { ImageAlgosService } from '../image-algos.service';
import { CanvasImageService } from '../canvas-image.service';
import { Point } from '../point';

export class Src2DstFitter {

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
  