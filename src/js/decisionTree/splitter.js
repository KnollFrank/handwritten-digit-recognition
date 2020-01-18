'use strict';

// adapted from https://machinelearningmastery.com/implement-decision-tree-algorithm-scratch-python/

class Splitter {

    constructor(treeListener) {
        this.treeListener = treeListener;
    }

    get_split_for_chunk({
        oneBasedStartIndexOfChunk,
        oneBasedEndIndexInclusiveOfChunk
    }, nodeId, dataset) {
        const class_values = getClassValsFromRows(dataset);
        const bestSplit = {
            index: 999,
            value: 999,
            score: 999,
            groups: undefined
        }
        for (let index = oneBasedStartIndexOfChunk - 1; index <= oneBasedEndIndexInclusiveOfChunk - 1; index++) {
            this.treeListener.onInnerSplit({
                nodeId: nodeId,
                startSplitIndex: oneBasedStartIndexOfChunk - 1,
                actualSplitIndex: index,
                endSplitIndex: oneBasedEndIndexInclusiveOfChunk - 1,
                numberOfEntriesInDataset: dataset.length
            });
            for (const row of dataset) {
                const groups = this.test_split(index, row[index], dataset);
                const gini = this.gini_index(groups, class_values);
                if (gini < bestSplit.score) {
                    bestSplit.index = index;
                    bestSplit.value = row[index];
                    bestSplit.score = gini;
                    bestSplit.groups = groups;
                }
            }
        }
        return bestSplit;
    }

    // Split a dataset based on an attribute and an attribute value
    test_split(index, value, dataset) {
        const left = [];
        const right = [];
        for (const row of dataset) {
            const splitCondition =
                isNumber(value) ?
                Number(row[index]) < Number(value) :
                row[index] == value;
            if (splitCondition) {
                left.push(row);
            } else {
                right.push(row);
            }
        }
        return [left, right];
    }

    // Calculate the Gini index for a split dataset
    gini_index(groups, classes) {
        const getP = group => class_val =>
            group
            .map(getClassValFromRow)
            .filter(classVal => classVal == class_val)
            .length / group.length;

        const getScore = group =>
            classes
            .map(getP(group))
            .map(p => p * p)
            .sum();

        const n_instances =
            groups
            .map(group => group.length)
            .sum();

        const gini =
            groups
            .filter(group => group.length != 0)
            .map(group => (1.0 - getScore(group)) * (group.length / n_instances))
            .sum();

        return gini;
    }
}