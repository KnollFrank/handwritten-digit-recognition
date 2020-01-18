import { isInnerNode } from './decisionTree/decisionTree.mjs';

'use strict';

export class NetworkBuilder {

    constructor(attributeNames, nodeContentFactory) {
        this.attributeNames = attributeNames;
        this.nodeContentFactory = nodeContentFactory;
    }

    createNetwork(node, depth = 0) {
        const { nodes, edges } = this._createNetwork(node, depth);
        return {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };
    }

    _createNetwork(node, depth) {
        if (!node) {
            return {
                nodes: [],
                edges: []
            };
        }
        return isInnerNode(node) ?
            this.createNetworkNodesFromLeftAndRightNodeChild(node, depth) :
            this.createNetworkNode(this.nodeContentFactory.getTerminalNodeContent(node), depth, node.id);
    }

    createNetworkNodesFromLeftAndRightNodeChild(node, depth) {
        let leftNetwork = this._createNetwork(node.left, depth + 1);
        let rightNetwork = this._createNetwork(node.right, depth + 1);

        let newNode = this.createNode(this.nodeContentFactory.getInnerNodeContent(node, this.attributeNames), depth, node.id);

        const createOneLevelEdges = (fromNode, toNodes, label) =>
            toNodes
            .filter(toNode => toNode.level == fromNode.level + 1)
            .map(toNode => ({
                from: fromNode.id,
                to: toNode.id,
                label: label
            }));

        const newEdges =
            createOneLevelEdges(newNode, leftNetwork.nodes, "true")
            .concat(
                createOneLevelEdges(newNode, rightNetwork.nodes, "false"));

        return {
            nodes: [newNode].concat(leftNetwork.nodes, rightNetwork.nodes),
            edges: newEdges.concat(leftNetwork.edges, rightNetwork.edges)
        };
    }

    createNetworkNode(label, depth, id) {
        return {
            nodes: [this.createNode(label, depth, id)],
            edges: []
        };
    }

    createNode(label, depth, id) {
        return {
            id: id,
            label: label,
            level: depth,
            shape: 'box'
        };
    }
}


let network = null;

function destroyNetwork() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

const options = {
    layout: {
        hierarchical: {
            direction: "UD"
        }
    },
    interaction: {
        hover: true,
        navigationButtons: true
    },
    nodes: {
        borderWidth: 1,
        color: {
            border: '#2B7CE9'
        },
        font: {
            multi: 'html',
            bold: '16px arial black'
        }
    },
    edges: {
        color: {
            inherit: false,
            color: '#2B7CE9'
        },
        width: 1
    },
    physics: {
        enabled: true
    }
};

export function displayNetwork(container, data) {
    destroyNetwork();
    network = new vis.Network(container, data, options);
}

// see https://stackoverflow.com/questions/38768598/vis-js-setoptions-to-change-color-on-network-node and http://jsfiddle.net/9knw26nc/1/
export function highlightNodes(allNodes, nodes) {
    resetAllNodeOptionsToDefault(allNodes);
    _highlightNodes(allNodes, nodes);
}

function resetAllNodeOptionsToDefault(allNodes) {
    updateNodes(
        allNodes,
        allNodes,
        node => {
            setNodeColor(node, options.nodes.color.border);
            setNodeBorderWidth(node, options.nodes.borderWidth);
        });
}

function _highlightNodes(allNodes, nodes) {
    updateNodes(
        nodes,
        allNodes,
        node => {
            setNodeColor(node, 'red');
            setNodeBorderWidth(node, 2);
        });
}

function updateNodes(nodes, allNodes, updateNode) {
    nodes.forEach(node => {
        updateNode(node);
        allNodes.update(node);
    });
}

function setNodeColor(node, color) {
    node.color = {
        border: color
    };
}

function setNodeBorderWidth(node, width) {
    node.borderWidth = width;
}

export function highlightEdges(allEdges, edges) {
    resetAllEdgeOptionsToDefault(allEdges);
    _highlightEdges(allEdges, edges);
}

function resetAllEdgeOptionsToDefault(allEdges) {
    updateEdges(allEdges, allEdges, edge => {
        setEdgeColor(edge, options.edges.color.color);
        delete edge.arrows;
        setEdgeWidth(edge, options.edges.width);
    });
}

function _highlightEdges(allEdges, edges) {
    updateEdges(edges, allEdges, edge => {
        setEdgeColor(edge, 'red');
        edge.arrows = 'to';
        setEdgeWidth(edge, 2);
    });
}

function updateEdges(edges, allEdges, updateEdge) {
    edges.forEach(edge => {
        updateEdge(edge);
        allEdges.update(edge);
    });
}

function setEdgeColor(edge, color) {
    edge.color = {
        color: color
    };
}

function setEdgeWidth(edge, width) {
    edge.width = width;
}