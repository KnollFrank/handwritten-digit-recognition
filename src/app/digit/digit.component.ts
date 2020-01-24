import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { CanvasImageService } from '../canvas-image.service';

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
  @Input() classListOfFigcaption;

  @ViewChild('canvas', { static: false }) public canvas: ElementRef<HTMLCanvasElement>;

  constructor(private canvasImageService: CanvasImageService) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.canvasImageService.drawImageIntoCanvas(
      {
        image: this.image,
        width: this.width,
        height: this.height
      },
      this.canvas.nativeElement);
  }
}
