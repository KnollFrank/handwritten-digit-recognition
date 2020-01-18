'use strict';

// Make a prediction with a decision tree
export function predict(node, row) {
    if (!node) {
        return {
            value: null,
            nodes: []
        };
    }

    if (isTerminalNode(node)) {
        return {
            value: node.value,
            nodes: [node]
        };
    }

    const splitCondition =
        isNumber(node.value) ?
        Number(row[node.index]) < Number(node.value) :
        row[node.index] == node.value;

    let {
        value,
        nodes
    } = predict(splitCondition ? node.left : node.right, row);
    return {
        value: value,
        nodes: [node].concat(nodes)
    };
}

export function isInnerNode(node) {
    return 'left' in node || 'right' in node;
}

export function isTerminalNode(node) {
    return !isInnerNode(node);
}