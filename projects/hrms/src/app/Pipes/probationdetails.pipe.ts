import { Pipe, PipeTransform } from '@angular/core';
import { IEntity, Iprobationapproval } from '../Interfaces/pendingapprovalsmodel';

@Pipe({
  name: 'probationdetails'
})
export class ProbationdetailsPipe implements PipeTransform {

  transform(active: Iprobationapproval[], searchValue: any): Iprobationapproval[] {
      if((!active) || !searchValue){
        return active;
     }
     return active.filter(p =>
      p.entity?.employeeId?.toString().includes(searchValue) ||
      p.entity?.employeeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.entity?.fusionEmployeeId?.toLowerCase().includes(searchValue.toLowerCase())
      )
  
    }

}
