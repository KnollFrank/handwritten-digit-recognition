import { Point } from './point'

export class BoundingBox {

    private constructor(public upperLeftCorner: Point, public lowerRightCorner: Point) {
    }

    public static fromUpperLeftCornerAndLowerRightCorner(upperLeftCorner: Point, lowerRightCorner: Point) {
        return new BoundingBox(upperLeftCorner, lowerRightCorner);
    }
}