import { Pipe, PipeTransform } from '@angular/core';
import { LeaveApproval } from '../Interfaces/pendingapprovalsmodel';

@Pipe({
  name: 'timeoffsearch'
})
export class TimeoffsearchPipe implements PipeTransform {

 transform(
     active: LeaveApproval[],
     searchValue: string
   ): LeaveApproval[] {
     if (!active || !searchValue) {
       return active;
     }
 
     searchValue = searchValue.toLowerCase();
 
     return active.filter(
       (p) =>
         p.entity?.leavefusionempId?.toLowerCase().includes(searchValue) ||
         p.entity?.employeeName?.toLowerCase().includes(searchValue) ||
         p.entity?.leaveDurationType?.toLowerCase().includes(searchValue) ||
         p.entity?.leaveCategoryName?.toLowerCase().includes(searchValue)
     );
   }

}
