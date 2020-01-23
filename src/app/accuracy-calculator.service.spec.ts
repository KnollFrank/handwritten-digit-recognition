import { TestBed } from '@angular/core/testing';

import { AccuracyCalculatorService } from './accuracy-calculator.service';

describe('AccuracyCalculatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccuracyCalculatorService = TestBed.get(AccuracyCalculatorService);
    expect(service).toBeTruthy();
  });
});
