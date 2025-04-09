import { Pipe, PipeTransform } from '@angular/core';
import { Iactive } from '../admin/active-employees/active-model';

@Pipe({
  name: 'activeEmployee'
})
export class ActiveEmployeePipe implements PipeTransform {

  transform(active: Iactive[], searchValue: any): Iactive[] {
    if((!active) || !searchValue){
      return active;
   }
   return active.filter(p =>
    p.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.emailaddress?.toLowerCase().includes(searchValue.toLowerCase())||
    `${p.firstName?.toLowerCase()} ${p.lastName?.toLowerCase()}`.includes(searchValue.toLowerCase()) ||
    p.fusionEmpId?.toLowerCase().includes(searchValue.toLowerCase())||
     p.contactnumber?.toString().includes(searchValue.toLowerCase())||
     p.location?.toString().includes(searchValue.toLowerCase())||
     p.subLocation?.toString().includes(searchValue.toLowerCase())||
     p.jobRole?.toString().includes(searchValue.toLowerCase())||
     p.substatus?.toString().includes(searchValue.toLowerCase())
    )

  }

}
