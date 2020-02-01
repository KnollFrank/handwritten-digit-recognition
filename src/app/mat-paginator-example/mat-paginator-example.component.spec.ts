import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatPaginatorExampleComponent } from './mat-paginator-example.component';

describe('MatPaginatorExampleComponent', () => {
  let component: MatPaginatorExampleComponent;
  let fixture: ComponentFixture<MatPaginatorExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatPaginatorExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatPaginatorExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
