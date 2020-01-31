import { Point } from './point'
import { Dimension } from './dimension';

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

    public static fromUpperLeftCornerAndDimension(upperLeftCorner: Point, dimension: Dimension) {
        const lowerRightCorner = upperLeftCorner.add(new Point(dimension.width, dimension.height));
        return BoundingBox.fromUpperLeftCornerAndLowerRightCorner(upperLeftCorner, lowerRightCorner);
    }

    public static fromCenterAndDimension(center: Point, dimension: Dimension) {
        const halfDimensionAsPoint = new Point(dimension.width, dimension.height).mul(0.5);
        const upperLeftCorner = center.sub(halfDimensionAsPoint);
        const lowerRightCorner = center.add(halfDimensionAsPoint);
        return BoundingBox.fromUpperLeftCornerAndLowerRightCorner(upperLeftCorner, lowerRightCorner);
    }
}