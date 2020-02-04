import { Injectable } from '@angular/core';
import { getClassValFromRow, getIndependentValsFromRow } from './dataset/datasetHelper';

@Injectable({
  providedIn: 'root'
})
export class AccuracyCalculatorService {

  constructor() { }

  public computeAccuracy({rowsClassifier, datasetDescription, dataset, receiveAccuracy}) {
    rowsClassifier(
      dataset.map(row => getIndependentValsFromRow(row, datasetDescription)),
      kNearestNeighborssWithPredictions =>
        receiveAccuracy(
          this.accuracy_percentage(
            this.getActualClassVals(dataset),
            this.getPredictions(kNearestNeighborssWithPredictions)))
    );
  }

  private getActualClassVals(fold) {
    return fold.map(getClassValFromRow);
  }

  private getPredictions(kNearestNeighborssWithPredictions) {
    return kNearestNeighborssWithPredictions.map(({ prediction }) => prediction);
  }

  // Calculate accuracy percentage
  private accuracy_percentage(actual, predicted) {
    let correct = 0;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] === predicted[i]) {
        correct++;
      }
    }
    return actual.length !== 0 ? correct / actual.length * 100.0 : 0;
  }
}
