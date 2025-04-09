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

    return proSpective.filter(p =>
      p.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      `${p.firstName?.toLowerCase()} ${p.lastName?.toLowerCase()}`.includes(searchValue.toLowerCase()) ||
      p.emailaddress?.toLowerCase().includes(searchValue.toLowerCase()) ||
      //p.fusionEmpId?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.employeeId?.toString().includes(searchValue.toLowerCase()) ||
      p.contactnumber?.toString().includes(searchValue.toLowerCase()) ||
      p.workEmail?.includes(searchValue.toLowerCase()) ||
      p.substatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.empstatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.lopcation?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.jobRole?.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

}
