import { TestBed } from '@angular/core/testing';

import { KnnBuilderService } from './knn-builder.service';

describe('KnnBuilderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KnnBuilderService = TestBed.get(KnnBuilderService);
    expect(service).toBeTruthy();
  });
});
