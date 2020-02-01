import { Component, OnInit, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-digits',
  templateUrl: './digits.component.html',
  styleUrls: ['./digits.component.css']
})
export class DigitsComponent implements OnInit {

  private _digitDataset;

  @Input() paginated: boolean;

  @Input() boxed: boolean;

  @Input()
  set digitDataset(digitDataset) {
    this._digitDataset = digitDataset;
    if (!this.paginated && this._digitDataset) {
      this.pageSize = this._digitDataset.length;
    }
    this.updatePagedDigitDataset();
  }

  get digitDataset() {
    return this._digitDataset;
  }

  pagedDigitDataset;

  pageSizeOptions: number[] = [80, 160, 240];
  pageSize = this.pageSizeOptions[0];
  pageIndex = 0;

  pageEvent: PageEvent;

  constructor() { }

  ngOnInit() {
  }

  handlePageEvent(pageEvent) {
    this.pageEvent = pageEvent;
    this.pageSize = this.pageEvent.pageSize;
    this.pageIndex = this.pageEvent.pageIndex;
    this.updatePagedDigitDataset();
  }

  private updatePagedDigitDataset() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedDigitDataset = this.digitDataset ? this.digitDataset.slice(start, end) : [];
  }
}
