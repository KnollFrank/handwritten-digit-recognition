import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ItemsIntoChunksSplitterService {

  constructor() { }

  public splitItemsIntoChunks({
    numItems,
    maxNumChunks
  }) {
    if (numItems == 0) {
      return [];
    }
    const chunks = [];
    const chunkSize = numItems < maxNumChunks ? 1 : Math.floor(numItems / maxNumChunks);
    for (let chunkIndex = 0; chunkIndex < Math.min(maxNumChunks, numItems) - 1; chunkIndex++) {
      chunks.push({
        oneBasedStartIndexOfChunk: chunkIndex * chunkSize + 1,
        oneBasedEndIndexInclusiveOfChunk: (chunkIndex + 1) * chunkSize
      });
    }
    chunks.push({
      oneBasedStartIndexOfChunk: (Math.min(maxNumChunks, numItems) - 1) * chunkSize + 1,
      oneBasedEndIndexInclusiveOfChunk: numItems
    });
    return chunks;
  }
}
