import { Pipe, PipeTransform } from '@angular/core';
import { Iprospective } from '../admin/prospective-employees/Prospective-model';
@Pipe({
  name: 'prospective'
})

export class ProspectivePipe implements PipeTransform {
  transform(proSpective: Iprospective[], searchValue: any,): Iprospective[] {
    if ((!proSpective) || !searchValue) {
      return proSpective;
    }

    const lowerSearch = searchValue.toString().toLowerCase().trim().replace(/\s+/g, ' ');

    return proSpective.filter(p => {
      const first = (p.firstName || '').toLowerCase().trim();
      const middle = (p.middleName || '').toLowerCase().trim();
      const last = (p.lastName || '').toLowerCase().trim();

      //  Full name variations
      const fullName = `${first} ${middle} ${last}`.replace(/\s+/g, ' ').trim();
      const shortFullName = `${first} ${last}`.replace(/\s+/g, ' ').trim();
      const reverseFullName = `${last} ${first} ${middle}`.replace(/\s+/g, ' ').trim();

      return (
        //  Name checks
        first.includes(lowerSearch) ||
        middle.includes(lowerSearch) ||
        last.includes(lowerSearch) ||
        fullName.includes(lowerSearch) ||
        shortFullName.includes(lowerSearch) ||
        reverseFullName.includes(lowerSearch) ||

        //  Other direct fields
        p.emailaddress?.toLowerCase().includes(lowerSearch) ||
        p.employeeId?.toString().toLowerCase().includes(lowerSearch) ||
        p.contactnumber?.toString().toLowerCase().includes(lowerSearch) ||
        p.workEmail?.toLowerCase().includes(lowerSearch) ||
        p.substatus?.toLowerCase().includes(lowerSearch) ||
        p.empstatus?.toLowerCase().includes(lowerSearch) ||
        p.lopcation?.toLowerCase().includes(lowerSearch) ||
        p.jobRole?.toLowerCase().includes(lowerSearch) ||
        p.jobDetails?.[0]?.lopcation?.toLowerCase().includes(lowerSearch) ||
        p.jobDetails?.[0]?.subLocation?.toLowerCase().includes(lowerSearch) ||
        // p.jobDetails?.[0]?.shiftName?.toLowerCase().includes(lowerSearch) ||
        p.jobDetails?.[0]?.jobRole?.toLowerCase().includes(lowerSearch)
      );
    });
  }
}