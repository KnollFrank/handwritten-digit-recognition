import { Injectable } from '@angular/core';
import { CanvasImageService } from './canvas-image.service';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class ImageAlgosService {

  constructor(private canvasImageService: CanvasImageService, private imageService: ImageService) { }

  public getCenterOfMass(image) {
    let totalMass = 0;
    let centerOfMass = new Point(0, 0);
    const origin = new Point(-1, -1);

    for (const { point, color: mass } of this.iterateOverImage(image)) {
      totalMass += mass;
      centerOfMass = centerOfMass.add(point.sub(origin).mul(mass));
    }

    if (totalMass === 0) {
      return null;
    }

    centerOfMass = centerOfMass.mul(1 / totalMass);
    return centerOfMass.sub(new Point(0, 0).sub(origin)); // == addPoints(centerOfMass, origin);
  }

  private *iterateOverImage(image) {
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const point = new Point(x, y);
        yield {
          point,
          color: this.imageService.getPixel({ image, point })
        };
      }
    }
  }
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(p: Point) {
    return new Point(this.x + p.x, this.y + p.y);
  }

  public mul(scalar: number) {
    return new Point(scalar * this.x, scalar * this.y);
  }

  public sub(p: Point) {
    return new Point(this.x - p.x, this.y - p.y);
  }
}