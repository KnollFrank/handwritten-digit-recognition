import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-free-hand-drawing-tool',
  templateUrl: './free-hand-drawing-tool.component.html',
  styleUrls: ['./free-hand-drawing-tool.component.css']
})
export class FreeHandDrawingToolComponent implements OnInit, AfterViewInit {

  @Output() imageData = new EventEmitter();

  @ViewChild('canvas', { static: false }) public canvasRef: ElementRef<HTMLCanvasElement>;
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private lastMouse = { x: 0, y: 0 };
  private mouse = { x: 0, y: 0 };
  private isMousedown = false;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.initializeDrawTool();
  }

  private initializeDrawTool() {
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 20;
    this.ctx.lineJoin = this.ctx.lineCap = 'round';
  }

  mousedown(e) {
    this.lastMouse = this.mouse = this.getMousePos(e);
    this.isMousedown = true;
  }

  mousemove(e) {
    this.mouse = this.getMousePos(e);
    if (this.isMousedown) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastMouse.x, this.lastMouse.y);
      this.ctx.lineTo(this.mouse.x, this.mouse.y);
      this.ctx.stroke();
    }
    this.lastMouse = this.mouse;
  }

  mouseup(e) {
    this.isMousedown = false;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.imageData.emit(imageData);
  }

  // taken from https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
  private getMousePos(evt) {
    const rect = this.canvas.getBoundingClientRect(); // abs. size of element
    const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for Y

    return {
      x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
    };
  }

  public clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
