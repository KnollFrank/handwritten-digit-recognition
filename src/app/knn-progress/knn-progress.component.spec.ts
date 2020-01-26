import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnnProgressComponent } from './knn-progress.component';

describe('KnnProgressComponent', () => {
  let component: KnnProgressComponent;
  let fixture: ComponentFixture<KnnProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnnProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnnProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
