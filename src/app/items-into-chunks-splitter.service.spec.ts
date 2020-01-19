import { TestBed } from '@angular/core/testing';

import { ItemsIntoChunksSplitterService } from './items-into-chunks-splitter.service';

describe('ItemsIntoChunksSplitterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ItemsIntoChunksSplitterService = TestBed.get(ItemsIntoChunksSplitterService);
    expect(service).toBeTruthy();
  });
});
