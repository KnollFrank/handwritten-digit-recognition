import { Injectable } from '@angular/core';
import { CanvasImageService } from './canvas-image.service';
import { ImageService } from './image.service';
import { Point } from './point';
import { BoundingBox } from './boundingBox';

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

  public getQuadraticBoundingBox(image) {
    return this.asQuadraticBoundingBox(this.getBoundingBox(image));
  }

  // FK-TODO: refactor
  private asQuadraticBoundingBox(boundingBox: BoundingBox) {
    const newWidthAndHeight = Math.max(boundingBox.width, boundingBox.height);
    const newUpperLeftCorner = boundingBox.center.sub(new Point(newWidthAndHeight, newWidthAndHeight).mul(0.5));
    const newLowerRightCorner = boundingBox.center.add(new Point(newWidthAndHeight, newWidthAndHeight).mul(0.5));
    return BoundingBox.fromUpperLeftCornerAndLowerRightCorner(newUpperLeftCorner, newLowerRightCorner);
  }

  // FK-TODO: introduce class BoundingBox with methods and use everywhere (also in other places, e.g. prediction.component.ts)
  public getBoundingBox(image) {
    let xMin = image.width;
    let xMax = 0;
    let yMin = image.height;
    let yMax = 0;

    for (const { point } of this.iterateOverFilteredImage(image, ({ color }) => color !== 0)) {
      if (point.x < xMin) {
        xMin = point.x;
      }
      if (point.x > xMax) {
        xMax = point.x;
      }
      if (point.y < yMin) {
        yMin = point.y;
      }
      if (point.y > yMax) {
        yMax = point.y;
      }
    }

    return BoundingBox.fromUpperLeftCornerAndLowerRightCorner(new Point(xMin, yMin), new Point(xMax, yMax));
  }

  private *iterateOverFilteredImage(image, filter) {
    for (const pointAndColor of this.iterateOverImage(image)) {
      if (filter(pointAndColor)) {
        yield pointAndColor;
      }
    }
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
