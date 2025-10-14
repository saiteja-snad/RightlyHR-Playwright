import { Pipe, PipeTransform } from '@angular/core';
import { Iactive } from '../admin/active-employees/active-model';

@Pipe({
  name: 'activeEmployee'
})
export class ActiveEmployeePipe implements PipeTransform {

transform(active: Iactive[], searchValue: any): Iactive[] {
    if (!active || !searchValue) {
      return active;
    }

    const lowerSearch = searchValue.toString().toLowerCase().trim().replace(/\s+/g, ' ');

    return active.filter(p => {
      const first = (p.firstName || '').toLowerCase().trim();
      const middle = (p.middleName || '').toLowerCase().trim();
      const last = (p.lastName || '').toLowerCase().trim();
      const fullName = `${first} ${middle} ${last}`.replace(/\s+/g, ' ').trim();
      const shortFullName = `${first} ${last}`.replace(/\s+/g, ' ').trim();
      const reverseFullName = `${last} ${first} ${middle}`.replace(/\s+/g, ' ').trim();

      return (
    
        first.includes(lowerSearch) ||
        middle.includes(lowerSearch) ||
        last.includes(lowerSearch) ||
        fullName.includes(lowerSearch) ||
        shortFullName.includes(lowerSearch) ||
        reverseFullName.includes(lowerSearch) ||
        p.fusionEmpId?.toLowerCase().includes(lowerSearch) ||
        p.emailaddress?.toLowerCase().includes(lowerSearch) ||
        p.workEmail?.toLowerCase().includes(lowerSearch) ||
        p.contactnumber?.toString().toLowerCase().includes(lowerSearch) ||
        p.location?.toLowerCase().includes(lowerSearch) ||
        p.subLocation?.toLowerCase().includes(lowerSearch) ||
        p.jobRole?.toLowerCase().includes(lowerSearch) ||
        p.substatus?.toLowerCase().includes(lowerSearch) ||

        //  Nested jobDetails[0]
        p.jobDetails?.[0]?.lopcation?.toLowerCase().includes(lowerSearch) ||
        p.jobDetails?.[0]?.subLocation?.toLowerCase().includes(lowerSearch) ||
        p.jobDetails?.[0]?.shiftName?.toLowerCase().includes(lowerSearch) ||
        p.jobDetails?.[0]?.jobRole?.toLowerCase().includes(lowerSearch)
      );
    });
  }
}
