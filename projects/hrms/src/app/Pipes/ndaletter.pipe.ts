import { Pipe, PipeTransform } from '@angular/core';
import { INDALetterDetails } from '../Interfaces/documentsHistory';

@Pipe({
  name: 'ndaletter'
})
export class NdaletterPipe implements PipeTransform {

 transform(probation: INDALetterDetails[], searchValue: any): INDALetterDetails[] {
     if ((!probation) || !searchValue) {
       return probation;
     }
     return probation.filter(p =>
       p.employeeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
       p.ndaSentDate?.toString().includes(searchValue)
     )
   }

}
