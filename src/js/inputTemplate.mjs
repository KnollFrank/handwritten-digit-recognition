import { getHtml } from './htmlHelper.mjs';

"use strict";

export function createInputElement(attributeName) {
    let div = getHtml('inputTemplate.html');
    div.querySelector('label').setAttribute('for', attributeName);
    div.querySelector('label').innerHTML = attributeName + ':';
    div.querySelector('input').setAttribute('id', attributeName);
    div.querySelector('input').setAttribute('name', attributeName);
    return div;
}