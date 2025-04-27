import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lastValue'
})
export class LastValuePipe implements PipeTransform {

  transform(value: string): string {
    const parts = value.split('/');
    return parts[parts.length - 1];
  }

}
