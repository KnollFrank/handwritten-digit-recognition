import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var Papa: any;

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.css']
})
export class FilePickerComponent implements OnInit {

  @Output() onReceiveCsvFileContents = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  fileChangeListener($event: any): void {
    let dataFile = $event.srcElement.files[0];
    this.readAndSubmitCSVFile(dataFile);
  }

  private readAndSubmitCSVFile(dataFile) {
    Papa.parse(dataFile, {
      download: true,
      header: false,
      complete: results => this.onReceiveCsvFileContents.emit(results.data)
    });
  }
}
