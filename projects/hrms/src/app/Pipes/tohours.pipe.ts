import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'tohours'
})
export class TohoursPipe implements PipeTransform {

  transform(value: string): number {
    if (!value) return 0;
    return parseFloat(moment.duration(value).asHours().toFixed(2));
  }

}
