import { Injectable } from '@angular/core';
import { CanvasImageService } from './canvas-image.service';
import { Point } from './point';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private canvasImageService: CanvasImageService) { }

  public getScaledImage({ image, kernelWidthAndHeight }) {
    const scaledImageWidth = image.width / kernelWidthAndHeight;
    const scaledImageHeight = image.height / kernelWidthAndHeight;
    const scaledImage = {
      pixels: Array(scaledImageWidth * scaledImageHeight).fill(0),
      width: scaledImageWidth,
      height: scaledImageHeight
    };

    for (let y = 0; y + kernelWidthAndHeight <= image.height; y += kernelWidthAndHeight) {
      for (let x = 0; x + kernelWidthAndHeight <= image.width; x += kernelWidthAndHeight) {
        const getPixelWithinKernel =
          (kernelX, kernelY) => this.getPixel({
            image,
            point: new Point(x + kernelX, y + kernelY)
          });
        this.putPixel({
          image: scaledImage,
          point: new Point(x, y).mul(1 / kernelWidthAndHeight),
          pixel: this.getAveragePixelValueWithinKernel(kernelWidthAndHeight, getPixelWithinKernel)
        });
      }
    }

    return scaledImage;
  }

  private getAveragePixelValueWithinKernel(kernelWidthAndHeight, getPixel) {
    let sum = 0;
    for (let y = 0; y < kernelWidthAndHeight; y++) {
      for (let x = 0; x < kernelWidthAndHeight; x++) {
        sum += getPixel(x, y);
      }
    }
    return Math.round(sum / (kernelWidthAndHeight ** 2));;
  }

  public getPixel({ image: { pixels, width }, point }) {
    return pixels[this.canvasImageService.getArrayIndexOfPoint(point, width)];
  }

  private putPixel({ image: { pixels, width }, point, pixel }) {
    pixels[this.canvasImageService.getArrayIndexOfPoint(point, width)] = pixel;
  }
}
