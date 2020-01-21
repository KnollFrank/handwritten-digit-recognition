import { Injectable } from '@angular/core';
import { CanvasImageService } from './canvas-image.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private canvasImageService: CanvasImageService) { }

  public getScaledImage({ image, kernelWidthAndHeight }) {
    const scaledImage_width = image.width / kernelWidthAndHeight;
    const scaledImage_height = image.height / kernelWidthAndHeight;
    const scaledImage = {
      pixels: Array(scaledImage_width * scaledImage_height).fill(0),
      width: scaledImage_width,
      height: scaledImage_height
    };

    for (let y = 0; y + kernelWidthAndHeight <= image.height; y += kernelWidthAndHeight) {
      for (let x = 0; x + kernelWidthAndHeight <= image.width; x += kernelWidthAndHeight) {
        const getPixelWithinKernel =
          (kernelX, kernelY) => this.getPixel({
            image: image,
            point: {
              x: x + kernelX,
              y: y + kernelY
            }
          });
        this.putPixel({
          image: scaledImage,
          point: {
            x: x / kernelWidthAndHeight,
            y: y / kernelWidthAndHeight
          },
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

  private getPixel({ image: { pixels, width }, point }) {
    return pixels[this.canvasImageService.getArrayIndexOfPoint(point, width)];
  }

  private putPixel({ image: { pixels, width }, point, pixel }) {
    pixels[this.canvasImageService.getArrayIndexOfPoint(point, width)] = pixel;
  }
}
