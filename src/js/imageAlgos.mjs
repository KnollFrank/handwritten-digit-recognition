import { getArrayIndexOfPoint } from './digit.mjs';

'use strict';

export function getCenterOfMass(image) {
    let totalMass = 0;
    let centerOfMass = { x: 0, y: 0 };
    const origin = { x: -1, y: -1 };

    for (const { point, color: mass }
        of iterateOverImage(image)) {
        totalMass += mass;
        centerOfMass = addPoints(centerOfMass, mulPoint(mass, subPoints(point, origin)));
    }

    if (totalMass === 0) {
        return null;
    }

    centerOfMass = mulPoint(1 / totalMass, centerOfMass);
    return subPoints(centerOfMass, subPoints({ x: 0, y: 0 }, origin)); // == addPoints(centerOfMass, origin);
}

function* iterateOverImage(image) {
    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            yield {
                point: { x: x, y: y },
                color: image.pixels[getArrayIndexOfPoint({ x, y }, image.width)]
            };
        }
    }
}

// FK-TODO: verwende die eingebaute Point-Klasse von JavaScript oder erzeuge eine eigene Point-Klasse mit Methoden für *, -, +
function addPoints(point1, point2) {
    return { x: point1.x + point2.x, y: point1.y + point2.y };
}

function mulPoint(scalar, { x, y }) {
    return { x: scalar * x, y: scalar * y };
}

function subPoints(point1, point2) {
    return { x: point1.x - point2.x, y: point1.y - point2.y };
}