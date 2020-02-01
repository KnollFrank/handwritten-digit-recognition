import { Component, OnInit, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-digits',
  templateUrl: './digits.component.html',
  styleUrls: ['./digits.component.css']
})
export class DigitsComponent implements OnInit {

  private _digitDataset;

  @Input()
  set digitDataset(digitDataset) {
    this._digitDataset = digitDataset;
    this.updatePagedDigitDataset();
  }

  get digitDataset() {
    return this._digitDataset;
  }

  pagedDigitDataset;
  pageSizeOptions: number[] = [80, 160, 240];
  pageEvent: PageEvent;

  get pageSize() {
    return this.pageEvent ? this.pageEvent.pageSize : this.pageSizeOptions[0];
  }

  get pageIndex() {
    return this.pageEvent ? this.pageEvent.pageIndex : 0;
  }

  get length() {
    return this.digitDataset ? this.digitDataset.length : 0;
  }

  constructor() { }

  ngOnInit() {
    this.updatePagedDigitDataset();
  }

  handlePageEvent(pageEvent) {
    this.pageEvent = pageEvent;
    this.updatePagedDigitDataset();
  }

  private updatePagedDigitDataset() {
    const start = this.pageIndex * this.pageSize;
    const end = (this.pageIndex + 1) * this.pageSize;
    this.pagedDigitDataset = this.digitDataset ? this.digitDataset.slice(start, end) : [];
  }
}
