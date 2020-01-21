import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeHandDrawingToolComponent } from './free-hand-drawing-tool.component';

describe('FreeHandDrawingToolComponent', () => {
  let component: FreeHandDrawingToolComponent;
  let fixture: ComponentFixture<FreeHandDrawingToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreeHandDrawingToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeHandDrawingToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
