import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ItemsIntoChunksSplitterService } from '../items-into-chunks-splitter.service';
import { knnWorkers } from '../knn/knnWorkers.js';
import { FormBuilder, Validators } from '@angular/forms';
import { Cache } from '../cache';
import { getPredictionFromKNearestNeighbors } from '../knn/KNN';
import { getClassValFromRow, getIndependentValsFromRow } from '../dataset/datasetHelper';


@Component({
  selector: 'app-knn-builder',
  templateUrl: './knn-builder.component.html',
  styleUrls: ['./knn-builder.component.css']
})
export class KnnBuilderComponent implements OnInit {

  @Input() datasetDescription;

  knnForm = this.fb.group({
    k: ['3', [Validators.required, Validators.min(1)]]
  });

  @Output() knnClassifier = new EventEmitter();

  constructor(private itemsIntoChunksSplitterService: ItemsIntoChunksSplitterService, private fb: FormBuilder) { }

  ngOnInit() {
  }

  onSubmit() {
    this.buildKnnClassifier(knnWorkers);
  }

  get k() { return this.knnForm.get('k'); }

  private buildKnnClassifier(knnWorkers) {
    const fittedKnnWorkers = this.fitKnnWorkers(
      knnWorkers,
      {
        X: this.datasetDescription.splittedDataset.train.map(row => getIndependentValsFromRow(row, this.datasetDescription)),
        y: this.datasetDescription.splittedDataset.train.map(getClassValFromRow),
        k: this.knnForm.value.k
      });
    this.knnClassifier.emit(this.createKnnClassifier(fittedKnnWorkers));
  }

  private fitKnnWorkers(knnWorkers, fitParams) {
    for (const knnWorker of knnWorkers) {
      this.fitKnnWorker(knnWorker, fitParams);
    }
    return knnWorkers;
  }

  private fitKnnWorker(knnWorker, fitParams) {
    knnWorker.postMessage({
      type: 'fit',
      params: fitParams
    });

    knnWorker.onerror = e => console.log(`There is an error with a knnWorker in file ${e.filename}, line ${e.lineno}:`, e.message);
  }

  private createKnnClassifier(knnWorkers) {
    return (
      {
        rows,
        receivePredictionsForRows,
        receiveKnnProgress = ({ workerIndex, actualIndexZeroBased, endIndexZeroBasedExclusive }) => { }
      }
    ) => {
      const chunks = this.itemsIntoChunksSplitterService.splitItemsIntoChunks({
        numItems: rows.length,
        maxNumChunks: knnWorkers.length
      });
      if (chunks.length === 0) {
        receivePredictionsForRows([]);
      } else {
        const chunksOfPredictions = [];
        chunks.forEach((chunk, i, chunks) => {
          this.getKNearestNeighbors({
            knnWorker: knnWorkers[i],
            knnWorkerIndex: i,
            X: this.getSlice(rows, chunk),
            receivePredictions: kNearestNeighborssWithPredictions => {
              chunksOfPredictions.push({ chunk, kNearestNeighborssWithPredictions });
              if (chunksOfPredictions.length === chunks.length) {
                receivePredictionsForRows(this.combineChunksOfPredictions(chunksOfPredictions));
              }
            },
            receiveKnnProgress
          });
        });
      }
    };
  }

  private getSlice(rows, chunk) {
    const {
      zeroBasedStartIndexOfChunk,
      zeroBasedEndIndexExclusiveOfChunk
    } = this.asJsStartAndEndIndexes(chunk);
    return rows.slice(zeroBasedStartIndexOfChunk, zeroBasedEndIndexExclusiveOfChunk);
  }

  private asJsStartAndEndIndexes({
    oneBasedStartIndexOfChunk,
    oneBasedEndIndexInclusiveOfChunk
  }) {
    const zeroBasedStartIndexOfChunk = oneBasedStartIndexOfChunk - 1;
    const zeroBasedEndIndexInclusiveOfChunk = oneBasedEndIndexInclusiveOfChunk - 1;
    const zeroBasedEndIndexExclusiveOfChunk = zeroBasedEndIndexInclusiveOfChunk + 1;
    return {
      zeroBasedStartIndexOfChunk,
      zeroBasedEndIndexExclusiveOfChunk
    };
  }

  private getKNearestNeighbors({ knnWorker, knnWorkerIndex, X, receivePredictions, receiveKnnProgress }) {
    knnWorker.onmessage = event => {
      const { type, value } = event.data;
      switch (type) {
        case 'result': {
          const kNearestNeighborss = value;
          const kNearestNeighborssWithPredictions = kNearestNeighborss.map(this.addPrediction);
          receivePredictions(kNearestNeighborssWithPredictions);
          break;
        }
        case 'progress': {
          const { actualIndexZeroBased, endIndexZeroBasedExclusive } = value;
          receiveKnnProgress({ workerIndex: knnWorkerIndex, actualIndexZeroBased, endIndexZeroBasedExclusive });
          break;
        }
      }
    };

    knnWorker.postMessage({
      type: 'getKNearestNeighbors',
      params: { X }
    });
  }

  private addPrediction(kNearestNeighbors) {
    return {
      kNearestNeighbors,
      prediction: getPredictionFromKNearestNeighbors(kNearestNeighbors)
    };
  }

  private combineChunksOfPredictions(chunksOfPredictions) {
    const predictions = {};
    for (const chunkOfPredictions of chunksOfPredictions) {
      this.copyChunkOfPredictions2Predictions(chunkOfPredictions, predictions);
    }
    return predictions;
  }

  private copyChunkOfPredictions2Predictions(chunkOfPredictions, predictions) {
    const {
      zeroBasedStartIndexOfChunk,
      zeroBasedEndIndexExclusiveOfChunk
    } = this.asJsStartAndEndIndexes(chunkOfPredictions.chunk);
    for (let i = zeroBasedStartIndexOfChunk; i < zeroBasedEndIndexExclusiveOfChunk; i++) {
      predictions[i] = chunkOfPredictions.kNearestNeighborssWithPredictions[i - zeroBasedStartIndexOfChunk];
    }
  }

  public getCachingRowsClassifier(classifier) {
    const cache = new Cache();
    return ({ rows, receivePredictionsForRows, receiveKnnProgress }) => {
      const nonCachedRows = rows.filter(row => !cache.containsKey(row));
      classifier(
        {
          rows: nonCachedRows,
          receivePredictionsForRows: nonCachedPredictions => {
            cache.cacheValuesForKeys({
              keys: nonCachedRows,
              values: nonCachedPredictions
            });
            const predictions = cache.getValuesForKeys({
              keys: rows
            });
            receivePredictionsForRows(predictions);
          },
          receiveKnnProgress
        });
    };
  }
}
