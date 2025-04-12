import { Pipe, PipeTransform } from '@angular/core';
import { IOfferLetterDetails } from '../interfaces/documentsHistory';

@Pipe({
  name: 'offerletterdashboardpipe'
})
export class OfferletterdashboardpipePipe implements PipeTransform {

 transform(probation: IOfferLetterDetails[], searchValue:any): IOfferLetterDetails[] {
    if((!probation) || !searchValue){
      return probation;
    }
    return probation.filter(p =>
 p.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.emailaddress?.toLowerCase().includes(searchValue.toLowerCase())||
    `${p.firstName?.toLowerCase()} ${p.lastName?.toLowerCase()}`.includes(searchValue.toLowerCase()) ||
    p.fusionEmpId?.toLowerCase().includes(searchValue.toLowerCase())||
     p.contactnumber?.toString().includes(searchValue.toLowerCase())||
     p.substatus?.toString().includes(searchValue.toLowerCase())||
     p.subLocation?.toString().includes(searchValue.toLowerCase())||
     p.workLocation?.toString().includes(searchValue.toLowerCase())||
     p.jobRole?.toString().includes(searchValue.toLowerCase())
    )
  }

}
