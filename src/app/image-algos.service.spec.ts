import { TestBed } from '@angular/core/testing';

import { ImageAlgosService } from './image-algos.service';

describe('ImageAlgosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageAlgosService = TestBed.get(ImageAlgosService);
    expect(service).toBeTruthy();
  });
});
