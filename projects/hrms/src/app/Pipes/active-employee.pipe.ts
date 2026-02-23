import { Pipe, PipeTransform } from '@angular/core';
import { Iactive } from '../admin/active-employees/active-model';

@Pipe({
  name: 'activeEmployee'
})
export class ActiveEmployeePipe implements PipeTransform {

  transform(active: Iactive[], searchValue: any): Iactive[] {
    if (!active || active.length === 0) {
      return active;
    }

    if (!searchValue || searchValue.toString().trim() === '') {
      return active;
    }

    const lowerSearch = searchValue.toString().toLowerCase().trim().replace(/\s+/g, ' ');

    return active.filter(p => {
      const first = (p.firstName || '').toLowerCase().trim();
      const middle = (p.middleName || '').toLowerCase().trim();
      const last = (p.lastName || '').toLowerCase().trim();

      // Build full name with proper spacing (remove empty middle name)
      const nameParts = [first, middle, last].filter(part => part.length > 0);
      const fullName = nameParts.join(' ');
      const shortFullName = [first, last].filter(part => part.length > 0).join(' ');
      const reverseFullName = [last, first, middle].filter(part => part.length > 0).join(' ');

      return (
        first.includes(lowerSearch) ||
        middle.includes(lowerSearch) ||
        last.includes(lowerSearch) ||
        fullName.includes(lowerSearch) ||
        shortFullName.includes(lowerSearch) ||
        reverseFullName.includes(lowerSearch) ||
        (p.fusionEmpId && p.fusionEmpId.toLowerCase().includes(lowerSearch)) ||
        (p.workEmail && p.workEmail.toLowerCase().includes(lowerSearch)) ||
        (p.contactnumber && p.contactnumber.toString().toLowerCase().includes(lowerSearch)) ||
        (p.location && p.location.toLowerCase().includes(lowerSearch)) ||
        (p.subLocation && p.subLocation.toLowerCase().includes(lowerSearch)) ||
        (p.jobRole && p.jobRole.toLowerCase().includes(lowerSearch)) ||
        (p.substatus && p.substatus.toLowerCase().includes(lowerSearch)) ||
        (p.jobDetails?.[0]?.lopcation && p.jobDetails[0].lopcation.toLowerCase().includes(lowerSearch)) ||
        (p.jobDetails?.[0]?.subLocation && p.jobDetails[0].subLocation.toLowerCase().includes(lowerSearch)) ||
        (p.jobDetails?.[0]?.shiftName && p.jobDetails[0].shiftName.toLowerCase().includes(lowerSearch)) ||
        (p.jobDetails?.[0]?.jobRole && p.jobDetails[0].jobRole.toLowerCase().includes(lowerSearch))
      );
    });
  }
}
