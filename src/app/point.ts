export class Point {
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
