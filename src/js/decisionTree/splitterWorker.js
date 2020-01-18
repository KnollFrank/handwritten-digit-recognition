'use strict';

class SplitterWorker {

    postMessage;

    onmessage(message) {
        this.postMessage({
            type: 'result',
            value: this.get_split_for_chunk(message)
        });
    }

    get_split_for_chunk({ chunk, nodeId, dataset }) {
        return new Splitter({
            onNodeAdded: node => {},
            onEdgeAdded: (fromNode, toNode) => {},
            onStartSplit: nodeId => {},
            onInnerSplit: ({ nodeId, startSplitIndex, actualSplitIndex, endSplitIndex, numberOfEntriesInDataset }) => {
                this.postMessage({
                    type: 'inner-split',
                    value: { nodeId, startSplitIndex, actualSplitIndex, endSplitIndex, numberOfEntriesInDataset }
                });
            },
            onEndSplit: nodeId => {}
        }).get_split_for_chunk(chunk, nodeId, dataset);
    }
}