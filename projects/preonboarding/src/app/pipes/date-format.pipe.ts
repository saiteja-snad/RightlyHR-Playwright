import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'dateFormat'
})

export class DateFormatPipe implements PipeTransform {
  private customsetup: any;
  private datePipe: DatePipe;

  constructor() {
    // Retrieve the date format from environment during initialization
    this.customsetup = environment.dateformat;
    this.datePipe = new DatePipe('en-US');
  }

  transform(value: any, ...args: unknown[]): unknown {
    if (value) {
      return this.datePipe.transform(value, this.customsetup);
    }
    return null;
  }
}