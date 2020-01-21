import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanvasImageService {

  constructor() { }

  public clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
}
