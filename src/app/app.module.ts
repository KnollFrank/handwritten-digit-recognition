import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FilePickerComponent } from './file-picker/file-picker.component';
import { DatasetComponent } from './dataset/dataset.component';

@NgModule({
  declarations: [
    AppComponent,
    FilePickerComponent,
    DatasetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
