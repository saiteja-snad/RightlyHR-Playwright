import { Pipe, PipeTransform } from '@angular/core';
import { Iallemployees } from '../Interfaces/allemployees.model';

@Pipe({
  name: 'allEmployees'
})
export class AllEmployeesPipe implements PipeTransform {

transform(allemployees: Iallemployees[], searchValue: any): Iallemployees[] {
  if ((!allemployees) || !searchValue) {
    return allemployees;
  }

  const lowerSearch = searchValue.toLowerCase();

  return allemployees.filter(p =>
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
    p.jobDetails?.lopcation?.toLowerCase().includes(lowerSearch) ||
    p.jobDetails?.subLocation?.toLowerCase().includes(lowerSearch) ||
    p.jobDetails?.shiftName?.toLowerCase().includes(lowerSearch) ||
    p.jobDetails?.jobRole?.toLowerCase().includes(lowerSearch)
  );
}
}
