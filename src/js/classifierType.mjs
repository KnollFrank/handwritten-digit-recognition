'use strict';

export const ClassifierType = Object.freeze({
    DECISION_TREE: 'DECISION_TREE',
    KNN: 'KNN',
    from: function(name) {
        name = name ? name.toUpperCase() : "";
        return [this.DECISION_TREE, this.KNN].includes(name) ? name : this.DECISION_TREE;
    }
});