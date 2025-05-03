import { Pipe, PipeTransform } from '@angular/core';
import { ISeparation } from '../time-off/pending-approvals/separation-for-you-request/separation-for-you-request';

@Pipe({
  name: 'pendingapprovalsseparation'
})
export class PendingapprovalsseparationPipe implements PipeTransform {

   transform(active: ISeparation[], searchValue: any): ISeparation[] {
      if((!active) || !searchValue){
        return active;
     }
     return active.filter(p =>
      p.entity?.spRequesterName.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.entity?.spRequestFusionEmployeeId.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.entity?.spDepartment.toLowerCase().includes(searchValue.toLowerCase())||
      p.entity?.spTeam.toLowerCase().includes(searchValue.toLowerCase())
      )
  
    }

}
