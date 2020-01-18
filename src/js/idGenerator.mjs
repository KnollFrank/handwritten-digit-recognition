"use strict";

let idCounter = 0;

export function newId() {
    return ++idCounter;
}