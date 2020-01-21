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
    let centerOfMass = { x: 0, y: 0 };
    const origin = { x: -1, y: -1 };

    for (const { point, color: mass } of this.iterateOverImage(image)) {
      totalMass += mass;
      centerOfMass = this.addPoints(centerOfMass, this.mulPoint(mass, this.subPoints(point, origin)));
    }

    if (totalMass === 0) {
      return null;
    }

    centerOfMass = this.mulPoint(1 / totalMass, centerOfMass);
    return this.subPoints(centerOfMass, this.subPoints({ x: 0, y: 0 }, origin)); // == addPoints(centerOfMass, origin);
  }

  private *iterateOverImage(image) {
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const point = { x, y }
        yield {
          point,
          color: this.imageService.getPixel({ image, point })
        };
      }
    }
  }

  // FK-TODO: verwende die eingebaute Point-Klasse von JavaScript oder erzeuge eine eigene Point-Klasse mit Methoden für *, -, +
  private addPoints(point1, point2) {
    return { x: point1.x + point2.x, y: point1.y + point2.y };
  }

  private mulPoint(scalar, { x, y }) {
    return { x: scalar * x, y: scalar * y };
  }

  private subPoints(point1, point2) {
    return { x: point1.x - point2.x, y: point1.y - point2.y };
  }
}
