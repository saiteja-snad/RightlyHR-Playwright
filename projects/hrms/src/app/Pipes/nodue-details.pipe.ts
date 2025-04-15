import { Pipe, PipeTransform } from '@angular/core';
import { InoDuepending } from '../time-off/pending-approvals/nodue-approval-details/nodue-approval-details';

@Pipe({
  name: 'nodueDetails'
})
export class NodueDetailsPipe implements PipeTransform {

  transform(probation: InoDuepending[], searchValue:any): InoDuepending[] {
     if((!probation) || !searchValue){
       return probation;
     }
  
     return probation.filter(p =>
     p.processedByName?.toLowerCase().includes(searchValue.toLowerCase()) ||
     p.departmentName?.toLowerCase().includes(searchValue.toLowerCase()) ||
     p.status?.toLowerCase().includes(searchValue.toLowerCase()) ||
     p.requiredEmails?.toLowerCase().includes(searchValue.toLowerCase())||
      p.employeeFusionEmpId?.toString().includes(searchValue.toLowerCase())
     )
   }

}
