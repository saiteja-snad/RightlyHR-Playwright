import { Pipe, PipeTransform } from '@angular/core';
import { IProbationEmployees } from '../admin/probation-employees/probation-emp-module';

@Pipe({
  name: 'probationEmp'
})
export class ProbationEmpPipe implements PipeTransform {

  transform(probation: IProbationEmployees[], searchValue:any): IProbationEmployees[] {
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
     p.location?.toString().includes(searchValue.toLowerCase())||
     p.substatus?.toString().includes(searchValue.toLowerCase())
    )
  }

}
