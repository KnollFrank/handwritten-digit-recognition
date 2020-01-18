'use strict';

export class EnhancedNodeContentFactory {

    getInnerNodeContent(node, attributeNames) {
        return `${getTestNodeText(node, attributeNames)}
${getGiniNodeText(node)}
${getAnzahlNodeText(node)}`;
    }

    getTerminalNodeContent(node) {
        return `${getVorhersageNodeText(node)}
${getGiniNodeText(node)}
${getAnzahlNodeText(node)}`;
    }
}

export class SimpleNodeContentFactory {

    getInnerNodeContent(node, attributeNames) {
        return getTestNodeConditionText(node, attributeNames);
    }

    getTerminalNodeContent(node) {
        return node.value;
    }
}

function getTestNodeText(node, attributeNames) {
    return `Test = <b>"${getTestNodeConditionText(node, attributeNames)}"</b>`;
}

function getTestNodeConditionText(node, attributeNames) {
    return `${attributeNames[node.index]} ${isNumber(node.value) ? '<' : '='} ${node.value}`;
}

function getGiniNodeText(node) {
    return `gini = ${toFixed4Digits(node.score)}`;
}

function getAnzahlNodeText(node) {
    return `Anzahl Datensätze = ${node.samples}`;
}

function getVorhersageNodeText(node) {
    return `Vorhersage = <b>${node.value}</b>`;
}

function toFixed4Digits(x) {
    return Number.parseFloat(x).toFixed(4);
}