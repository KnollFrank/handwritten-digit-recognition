import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-mat-paginator-example',
  templateUrl: './mat-paginator-example.component.html',
  styleUrls: ['./mat-paginator-example.component.css']
})
export class MatPaginatorExampleComponent implements OnInit {

  // MatPaginator Inputs
  knnForm = this.fb.group({
    length: ['100'],
    pageSize: ['10']
  });

  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
  }
}
