import { Component, OnInit, Input } from '@angular/core';

declare var getClassValFromRow: any;

@Component({
  selector: 'app-digits',
  templateUrl: './digits.component.html',
  styleUrls: ['./digits.component.css']
})
export class DigitsComponent implements OnInit {

  @Input() digitDataset;

  constructor() { }

  ngOnInit() {
  }
}
