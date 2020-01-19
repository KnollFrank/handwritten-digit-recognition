import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnnBuilderComponent } from './knn-builder.component';

describe('KnnBuilderComponent', () => {
  let component: KnnBuilderComponent;
  let fixture: ComponentFixture<KnnBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnnBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnnBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
