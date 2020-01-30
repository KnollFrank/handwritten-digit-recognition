import { Point } from './point'

export class BoundingBox {

    private constructor(public upperLeftCorner: Point, public lowerRightCorner: Point) {
    }

    public get width() {
        return this.lowerRightCorner.x - this.upperLeftCorner.x;
    }

    public get height() {
        return this.lowerRightCorner.y - this.upperLeftCorner.y;
    }

    public get center() {
        return this.upperLeftCorner.add(new Point(this.width, this.height).mul(0.5));
    }

    public static fromUpperLeftCornerAndLowerRightCorner(upperLeftCorner: Point, lowerRightCorner: Point) {
        return new BoundingBox(upperLeftCorner, lowerRightCorner);
    }

    public static fromUpperLeftCornerAndWidthAndHeight(upperLeftCorner: Point, width: number, height: number) {
        const lowerRightCorner = upperLeftCorner.add(new Point(width, height));
        return BoundingBox.fromUpperLeftCornerAndLowerRightCorner(upperLeftCorner, lowerRightCorner);
    }

    public static fromCenterAndWidthAndHeight(center: Point, width: number, height: number) {
        const upperLeftCorner = center.sub(new Point(width, height).mul(0.5));
        const lowerRightCorner = center.add(new Point(width, height).mul(0.5));
        return BoundingBox.fromUpperLeftCornerAndLowerRightCorner(upperLeftCorner, lowerRightCorner);
    }
}