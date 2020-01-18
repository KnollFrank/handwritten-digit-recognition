import { Component, OnInit } from '@angular/core';
import { CacheService } from './cache.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular';

  constructor(private cache: CacheService) {

  }

  ngOnInit(): void {
    console.log(this.cache.get('someKey', () => Math.floor(Math.random()*100)));
    console.log(this.cache.get('someKey', () => Math.floor(Math.random()*100)));
  }

  onReceiveCsvFileContents(csvFileContents) {
    console.log('csvFileContents:', csvFileContents);
  }
}
