import { SimpleNodeContentFactory } from './nodeContentFactories.mjs';
import { isInnerNode } from './decisionTree.mjs';

'use strict';

// Print a decision tree
export function print_tree(node, attributeNames) {
    const nodeContentFactory = new SimpleNodeContentFactory();

    function _print_tree(node, depth) {
        if (!node) {
            return;
        }

        if (isInnerNode(node)) {
            console.log(`${' '.repeat(depth)}[${node.id}: ${nodeContentFactory.getInnerNodeContent(node, attributeNames)}]`);
            _print_tree(node.left, depth + 1);
            _print_tree(node.right, depth + 1);
        } else {
            console.log(`${' '.repeat(depth)}[${node.id}: ${nodeContentFactory.getTerminalNodeContent(node)}]`);
        }
    }

    _print_tree(node, 0);
}