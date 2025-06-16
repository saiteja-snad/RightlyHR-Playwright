import { Pipe, PipeTransform } from '@angular/core';
import { Iactive } from '../admin/active-employees/active-model';

@Pipe({
  name: 'inactiveEmployee'
})
export class InactiveEmployeePipe implements PipeTransform {

 transform(active: Iactive[], searchValue: any): Iactive[] {
  if ((!active) || !searchValue) {
    return active;
  }

  const lowerSearch = searchValue.toLowerCase();

  return active.filter(p =>
    p.firstName?.toLowerCase().includes(lowerSearch) ||
    p.lastName?.toLowerCase().includes(lowerSearch) ||
    `${p.firstName?.toLowerCase()} ${p.lastName?.toLowerCase()}`.includes(lowerSearch) ||
    p.emailaddress?.toLowerCase().includes(lowerSearch) ||
    p.workEmail?.toLowerCase().includes(lowerSearch) ||
    p.fusionEmpId?.toLowerCase().includes(lowerSearch) ||
    p.contactnumber?.toString().includes(lowerSearch) ||
    p.location?.toLowerCase().includes(lowerSearch) ||
    p.subLocation?.toLowerCase().includes(lowerSearch) ||
    p.jobRole?.toLowerCase().includes(lowerSearch) ||
    p.substatus?.toLowerCase().includes(lowerSearch) ||
    
   
    p.jobDetails?.[0]?.lopcation?.toLowerCase().includes(lowerSearch) ||
    p.jobDetails?.[0]?.subLocation?.toLowerCase().includes(lowerSearch) ||
    p.jobDetails?.[0]?.shiftName?.toLowerCase().includes(lowerSearch) ||
    p.jobDetails?.[0]?.jobRole?.toLowerCase().includes(lowerSearch)
  );
}


}
