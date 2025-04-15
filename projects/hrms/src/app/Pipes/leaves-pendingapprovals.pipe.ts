import { Pipe, PipeTransform } from '@angular/core';
import { LeaveApproval } from '../Interfaces/pendingapprovalsmodel';

@Pipe({
  name: 'leavesPendingapprovals'
})
export class LeavesPendingapprovalsPipe implements PipeTransform {

 transform(active: LeaveApproval[], searchValue: any): LeaveApproval[] {
     if((!active) || !searchValue){
       return active;
    }
    return active.filter(p =>
     p.entity.leavefusionempId?.toLowerCase().includes(searchValue.toLowerCase()) ||
     p.entity.leaveCategoryName?.toLowerCase().includes(searchValue.toLowerCase()) ||
     `${p.entity.employeeName?.toLowerCase()}`.includes(searchValue.toLowerCase())
     )
   }

}
