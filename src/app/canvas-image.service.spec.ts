import { TestBed } from '@angular/core/testing';

import { CanvasImageService } from './canvas-image.service';

describe('CanvasImageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CanvasImageService = TestBed.get(CanvasImageService);
    expect(service).toBeTruthy();
  });
});
