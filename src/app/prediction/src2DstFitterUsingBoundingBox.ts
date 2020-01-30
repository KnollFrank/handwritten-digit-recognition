import { ImageAlgosService } from '../image-algos.service';
import { CanvasImageService } from '../canvas-image.service';
import { BoundingBox } from '../boundingBox';
import { Point } from '../point';

export class Src2DstFitterUsingBoundingBox {

    constructor(
        private imageAlgosService: ImageAlgosService,
        private canvasImageService: CanvasImageService) {

    }

    public fitSrc2Dst({ srcImageData, dstCanvas }) {
        // FK-TODO: refactor
        const originalImageWidthAndHeight = 28;
        const originalBoundingBoxWidthAndHeight = 20;
        const kernelWidthAndHeight = originalImageWidthAndHeight / dstCanvas.width;
        const boundingBoxWidthAndHeight = originalBoundingBoxWidthAndHeight / kernelWidthAndHeight;

        this.drawBoundingBoxedImageOntoCanvas({
            image: this.createCanvasContainingImageData(srcImageData),
            boundingBox: this.getQuadraticBoundingBox(srcImageData),
            canvas: dstCanvas,
            newImageWidthAndHeight: boundingBoxWidthAndHeight
        });
    }

    private createCanvasContainingImageData(imageData: any) {
        const canvas = this.canvasImageService.createCanvas(imageData);
        canvas.getContext('2d').putImageData(imageData, 0, 0);
        return canvas;
    }

    private getQuadraticBoundingBox(srcImageData: any): any {
        return this.imageAlgosService.getQuadraticBoundingBox(this.canvasImageService.createImage(srcImageData));
    }

    private drawBoundingBoxedImageOntoCanvas({ image, boundingBox, canvas, newImageWidthAndHeight }) {
        this.canvasImageService.clearCanvas(canvas);
        const boundingBoxNew = BoundingBox.fromUpperLeftCornerAndWidthAndHeight(new Point((canvas.width - newImageWidthAndHeight) / 2, (canvas.height - newImageWidthAndHeight) / 2), newImageWidthAndHeight, newImageWidthAndHeight);
        canvas.getContext('2d').drawImage(
            image,
            boundingBox.upperLeftCorner.x,
            boundingBox.upperLeftCorner.y,
            boundingBox.width,
            boundingBox.height,
            boundingBoxNew.upperLeftCorner.x,
            boundingBoxNew.upperLeftCorner.y,
            boundingBoxNew.width,
            boundingBoxNew.height);
    }
}