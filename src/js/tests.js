import { train_test_split } from './main.mjs';

QUnit.test("should not prune terminal node", function(assert) {
    const jsonTree = `
    {
        "id": 6,
        "value": "0"
    }`;
    shouldPruneTree(assert, jsonTree, jsonTree);
});

QUnit.test("should not prune", function(assert) {
    const jsonTree = `
    {
        "index": 0,
        "value": "0.3223",
        "id": 1,
        "left": {
            "index": 1,
            "value": "5.8974",
            "id": 2,
            "left": {
                "id": 3,
                "value": "1"
            },
            "right": {
                "id": 4,
                "value": "0"
            }
        },
        "right": {
            "index": 0,
            "value": "1.7452",
            "id": 5,
            "left": {
                "id": 6,
                "value": "0"
            },
            "right": {
                "id": 7,
                "value": "1"
            }
        }
    }`;

    shouldPruneTree(assert, jsonTree, jsonTree);
});

QUnit.test("should prune right child", function(assert) {
    const jsonTree = `
    {
        "index": 0,
        "value": "0.3223",
        "id": 1,
        "left": {
            "index": 1,
            "value": "5.8974",
            "id": 2,
            "left": {
                "id": 3,
                "value": "1"
            },
            "right": {
                "id": 4,
                "value": "0"
            }
        },
        "right": {
            "index": 0,
            "value": "1.7452",
            "id": 5,
            "left": {
                "id": 6,
                "value": "0"
            },
            "right": {
                "id": 7,
                "value": "0"
            }
        }
    }`;

    const jsonTreeExpected = `
    {
        "index": 0,
        "value": "0.3223",
        "id": 1,
        "left": {
            "index": 1,
            "value": "5.8974",
            "id": 2,
            "left": {
                "id": 3,
                "value": "1"
            },
            "right": {
                "id": 4,
                "value": "0"
            }
        },
        "right":{
                "id": 6,
                "value": "0"
            }
    }`;

    shouldPruneTree(assert, jsonTree, jsonTreeExpected);
});

QUnit.test("should prune twice", function(assert) {
    const jsonTree = `
    {
        "index": 0,
        "value": "2.3925",
        "id": 25,
        "left": {
            "index": 2,
            "value": "0.0099913",
            "id": 26,
            "left": {
                "id": 27,
                "value": "0"
            },
            "right": {
                "id": 28,
                "value": "0"
            }
        },
        "right": {
            "index": 0,
            "value": "3.6216",
            "id": 29,
            "left": {
                "id": 30,
                "value": "0"
            },
            "right": {
                "id": 31,
                "value": "0"
            }
        }
    }`;

    const jsonTreeExpected = `
    {
        "id": 27,
        "value": "0"
    }`;

    shouldPruneTree(assert, jsonTree, jsonTreeExpected);
});

QUnit.test("should prune left and right child", function(assert) {
    const jsonTree = `
    {
        "index": 0,
        "value": "0.3223",
        "id": 1,
        "left": {
            "index": 1,
            "value": "5.8974",
            "id": 2,
            "left": {
                "id": 3,
                "value": "1"
            },
            "right": {
                "id": 4,
                "value": "1"
            }
        },
        "right": {
            "index": 0,
            "value": "1.7452",
            "id": 5,
            "left": {
                "id": 6,
                "value": "0"
            },
            "right": {
                "id": 7,
                "value": "0"
            }
        }
    }`;

    const jsonTreeExpected = `
    {
        "index": 0,
        "value": "0.3223",
        "id": 1,
        "left": {
                "id": 3,
                "value": "1"
            },
        "right": {
                "id": 6,
                "value": "0"
            }
    }`;

    shouldPruneTree(assert, jsonTree, jsonTreeExpected);
});

function shouldPruneTree(assert, jsonTree, jsonTreeExpected) {
    const tree = JSON.parse(jsonTree);
    const prunedTree = prune(tree);
    // console.log('tree');
    // print_tree(tree, ['variance', 'skewness', 'curtosis', 'entropy', 'class']);
    // console.log('prunedTree');
    // print_tree(prunedTree, ['variance', 'skewness', 'curtosis', 'entropy', 'class']);
    // const prediction = predict(prunedTree, [0, 1, 2, 3, 0]);
    // console.log('prediction:', prediction);
    assert.deepEqual(prunedTree, JSON.parse(jsonTreeExpected));
}

QUnit.test("should train_test_split dataset", function(assert) {
    assert.deepEqual(
        train_test_split(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            0.8), {
            train: [1, 2, 3, 4, 5, 6, 7, 8],
            test: [9, 10]
        });

    assert.deepEqual(
        train_test_split(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            0.5), {
            train: [1, 2, 3, 4, 5],
            test: [6, 7, 8, 9, 10]
        });
});

QUnit.test("should split items into chunks", function(assert) {
    assert.deepEqual(
        splitItemsIntoChunks({
            numItems: 10,
            maxNumChunks: 2
        }), [{
            oneBasedStartIndexOfChunk: 1,
            oneBasedEndIndexInclusiveOfChunk: 5
        }, {
            oneBasedStartIndexOfChunk: 6,
            oneBasedEndIndexInclusiveOfChunk: 10
        }],
        "numItems: 10, maxNumChunks: 2");

    assert.deepEqual(
        splitItemsIntoChunks({
            numItems: 10,
            maxNumChunks: 3
        }), [{
            oneBasedStartIndexOfChunk: 1,
            oneBasedEndIndexInclusiveOfChunk: 3
        }, {
            oneBasedStartIndexOfChunk: 4,
            oneBasedEndIndexInclusiveOfChunk: 6
        }, {
            oneBasedStartIndexOfChunk: 7,
            oneBasedEndIndexInclusiveOfChunk: 10
        }],
        "numItems: 10, maxNumChunks: 3");

    assert.deepEqual(
        splitItemsIntoChunks({
            numItems: 10,
            maxNumChunks: 4
        }), [{
            oneBasedStartIndexOfChunk: 1,
            oneBasedEndIndexInclusiveOfChunk: 2
        }, {
            oneBasedStartIndexOfChunk: 3,
            oneBasedEndIndexInclusiveOfChunk: 4
        }, {
            oneBasedStartIndexOfChunk: 5,
            oneBasedEndIndexInclusiveOfChunk: 6
        }, {
            oneBasedStartIndexOfChunk: 7,
            oneBasedEndIndexInclusiveOfChunk: 10
        }],
        "numItems: 10, maxNumChunks: 4");

    assert.deepEqual(
        splitItemsIntoChunks({
            numItems: 5,
            maxNumChunks: 8
        }), [{
            oneBasedStartIndexOfChunk: 1,
            oneBasedEndIndexInclusiveOfChunk: 1
        }, {
            oneBasedStartIndexOfChunk: 2,
            oneBasedEndIndexInclusiveOfChunk: 2
        }, {
            oneBasedStartIndexOfChunk: 3,
            oneBasedEndIndexInclusiveOfChunk: 3
        }, {
            oneBasedStartIndexOfChunk: 4,
            oneBasedEndIndexInclusiveOfChunk: 4
        }, {
            oneBasedStartIndexOfChunk: 5,
            oneBasedEndIndexInclusiveOfChunk: 5
        }],
        "numItems: 5, maxNumChunks: 8");

    assert.deepEqual(
        splitItemsIntoChunks({
            numItems: 2,
            maxNumChunks: 2
        }), [{
            oneBasedStartIndexOfChunk: 1,
            oneBasedEndIndexInclusiveOfChunk: 1
        }, {
            oneBasedStartIndexOfChunk: 2,
            oneBasedEndIndexInclusiveOfChunk: 2
        }],
        "numItems: 2, maxNumChunks: 2");

    assert.deepEqual(
        splitItemsIntoChunks({
            numItems: 0,
            maxNumChunks: 4
        }), [],
        "numItems: 0, maxNumChunks: 4");

    assert.deepEqual(
        splitItemsIntoChunks({
            numItems: 1,
            maxNumChunks: 4
        }), [{
            oneBasedStartIndexOfChunk: 1,
            oneBasedEndIndexInclusiveOfChunk: 1
        }],
        "numItems: 1, maxNumChunks: 4");
});

QUnit.test("should getMinOfArray", function(assert) {
    assert.equal(
        getMinOfArray([3, 2, 1], (a, b) => Math.min(a, b)),
        1,
        "getMinOfArray([3, 2, 1], (a, b) => Math.min(a, b))");

    assert.equal(
        getMinOfArray(["aaa", "aa", "a"], (a, b) => a.length < b.length ? a : b),
        "a",
        'getMinOfArray(["aaa", "aa", "a"], (a, b) => a.length < b.length ? a : b)');
});

QUnit.test("k=1 nearest neighbors, 1 dim", function(assert) {
    function checkKNN(KNNFactory, testDescr) {
        // Given
        const X = [
            [0],
            [1],
            [2],
            [3]
        ];
        const y = [0, 0, 1, 1];
        const knn = KNNFactory(1);

        // When
        knn.fit(X, y);

        // Then
        assert.equal(knn.predict([1.1]), 0, testDescr + '[1.1] ~ [1] -> 0');
        assert.equal(knn.predict([1.9]), 1, testDescr + '[1.9] ~ [2] -> 1');
    }

    checkKNN(k => new KNN(k), 'KNN: ');
    checkKNN(k => new KNNUsingKDTree(k), 'KNNUsingKDTree: ');
});

QUnit.test("k=1 nearest neighbors, 2 dim", function(assert) {
    function checkKNN(KNNFactory, testDescr) {
        // Given
        const X = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1]
        ];
        const y = ['a', 'a', 'b', 'b'];
        const knn = KNNFactory(1);

        // When
        knn.fit(X, y);

        // Then
        assert.equal(knn.predict([1.1, 1.1]), 'a', testDescr + "[1.1, 1.1] ~ [1, 0] -> 'a'");
        assert.equal(knn.predict([-0.9, 0.1]), 'b', testDescr + "[-0.9, 0.1] ~ [-1, 0] -> 'b'");
    }

    checkKNN(k => new KNN(k), 'KNN: ');
    checkKNN(k => new KNNUsingKDTree(k), 'KNNUsingKDTree: ');
});

QUnit.test("nearest neighbors, k={3, 5}", function(assert) {
    function checkKNN(KNNFactory, testDescr) {
        // Given
        //      /--------- radius = 2
        //     /     B
        //    /    ----- radius = 1
        //   /    /  A
        //  /    /
        // | B  | B  X
        //  \    \  
        //   \    \  A
        //    \    ----- radius = 1
        //     \ --------- radius = 2
        const X = [
            [0, 0.5],
            [0, -0.5],
            [-0.5, 0],
            [-1.5, 0],
            [0, 1.5]
        ];
        const y = ['A', 'A', 'B', 'B', 'B'];

        {
            // Given
            const knn = KNNFactory(3);

            // When
            knn.fit(X, y);

            // Then
            assert.equal(knn.predict([0, 0]), 'A', testDescr + "A, A, B => A");
        }

        {
            // Given
            const knn = KNNFactory(5);

            // When
            knn.fit(X, y);

            // Then
            assert.equal(knn.predict([0, 0]), 'B', testDescr + "A, A, B, B, B => B");
        }
    }

    checkKNN(k => new KNN(k), 'KNN: ');
    checkKNN(k => new KNNUsingKDTree(k), 'KNNUsingKDTree: ');
});

QUnit.test("getKNearestNeighbors, k=3", function(assert) {
    function checkKNN(KNNFactory, testDescr) {
        // Given
        //      /--------- radius = 2
        //     /     B
        //    /    ----- radius = 1
        //   /    /  A
        //  /    /
        // | B  | B  X
        //  \    \  
        //   \    \  A
        //    \    ----- radius = 1
        //     \ --------- radius = 2
        const X = [
            [0, 0.5],
            [0, -0.5],
            [-0.5, 0],
            [-1.5, 0],
            [0, 1.5]
        ];
        const y = ['A', 'A', 'B', 'B', 'B'];

        {
            // Given
            const knn = KNNFactory(3);

            // When
            knn.fit(X, y);

            // Then
            assert.deepEqual(
                knn.getKNearestNeighbors([0, 0]), [{
                    x: [0, 0.5],
                    y: 'A',
                    distance: 0.5
                }, {
                    x: [0, -0.5],
                    y: 'A',
                    distance: 0.5
                }, {
                    x: [-0.5, 0],
                    y: 'B',
                    distance: 0.5
                }],
                testDescr + "getKNearestNeighbors: A, A, B => A");
        }
    }

    checkKNN(k => new KNN(k), 'KNN: ');
    // checkKNN(k => new KNNUsingKDTree(k), 'KNNUsingKDTree: ');
});

QUnit.test("center of mass of an image", function(assert) {
    assert.deepEqual(
        getCenterOfMass({
            pixels: [250, 250],
            width: 2,
            height: 1
        }), {
            x: 0.5,
            y: 0
        });

    assert.deepEqual(
        getCenterOfMass({
            pixels: [250, 10],
            width: 2,
            height: 1
        }), {
            x: ((250 * 1 + 10 * 2) / (250 + 10)) - 1,
            y: 0
        });

    assert.deepEqual(
        getCenterOfMass({
            pixels: [250, 250, 250, 250],
            width: 2,
            height: 2
        }), {
            x: 0.5,
            y: 0.5
        });

    assert.deepEqual(
        getCenterOfMass({
            pixels: [0, 0],
            width: 2,
            height: 1
        }),
        null);
});