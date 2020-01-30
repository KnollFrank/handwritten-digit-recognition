import { Injectable } from '@angular/core';
import { Point } from './point';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class CanvasImageService {

  constructor() { }

  public createCanvas({ width, height }) {
    return $('<canvas>')
      .attr('width', width)
      .attr('height', height)[0];
  }

  public clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  public imageData2Pixels(imageData) {
    const pixels = [];
    for (const it of this.iterateOverImageData(imageData)) {
      pixels.push(imageData.data[it.color_index.alpha]);
    }
    return pixels;
  }

  public drawImageIntoCanvas({ image, width, height }, canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    for (const it of this.iterateOverImageData(imageData)) {
      imageData.data[it.color_index.red] = 0;
      imageData.data[it.color_index.green] = 0;
      imageData.data[it.color_index.blue] = 0;
      imageData.data[it.color_index.alpha] = image[it.pixelIndex];
    }
    ctx.putImageData(imageData, 0, 0);
  }

  private *iterateOverImageData(imageData) {
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const i = this.getArrayIndexOfPoint({ x, y }, imageData.width);
        yield {
          point: new Point(x, y),
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

  public getArrayIndexOfPoint(point, width) {
    return point.y * width + point.x;
  }

  public createImage(imageData: any): any {
    return {
      pixels: this.imageData2Pixels(imageData),
      width: imageData.width,
      height: imageData.height
    };
  }
}
