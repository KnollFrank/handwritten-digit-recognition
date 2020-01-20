import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-digit',
  templateUrl: './digit.component.html',
  styleUrls: ['./digit.component.css']
})
export class DigitComponent implements OnInit, AfterViewInit {

  @Input() width: number;
  @Input() height: number;
  @Input() figcaption: string;
  @Input() image;

  @ViewChild('canvas', { static: false }) public canvas: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.drawImageIntoCanvas();
  }

  private drawImageIntoCanvas() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    for (const it of iterateOverImageData(imageData)) {
      imageData.data[it.color_index.red] = 0;
      imageData.data[it.color_index.green] = 0;
      imageData.data[it.color_index.blue] = 0;
      imageData.data[it.color_index.alpha] = this.image[it.pixelIndex];
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
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

export function getArrayIndexOfPoint(point, width) {
  return point.y * width + point.x;
}
