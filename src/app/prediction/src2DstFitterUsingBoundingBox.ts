import { ImageAlgosService } from '../image-algos.service';
import { CanvasImageService } from '../canvas-image.service';

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
        const { upperLeftCorner, lowerRightCorner } = boundingBox;
        const sx = upperLeftCorner.x;
        const sy = upperLeftCorner.y;
        const sWidth = lowerRightCorner.x - upperLeftCorner.x;
        const sHeight = lowerRightCorner.y - upperLeftCorner.y;
        const dWidth = newImageWidthAndHeight;
        const dHeight = newImageWidthAndHeight;
        const dx = (canvas.width - dWidth) / 2;
        const dy = (canvas.height - dHeight) / 2;
        canvas.getContext('2d').drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
}