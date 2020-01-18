import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var Papa: any;

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.css']
})
export class FilePickerComponent implements OnInit {

  @Output() childEvent = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  fileChangeListener($event: any): void {
    let dataFile = $event.srcElement.files[0];
    this.onSubmitDatasetForm(dataFile);
  }

  private onSubmitDatasetForm(dataFile) {
    Papa.parse(dataFile, {
      download: true,
      header: false,
      complete: results => this.childEvent.emit(results.data)
    });
  }
}
