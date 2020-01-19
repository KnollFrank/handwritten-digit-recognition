import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitsComponent } from './digits.component';

describe('DigitsComponent', () => {
  let component: DigitsComponent;
  let fixture: ComponentFixture<DigitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DigitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
