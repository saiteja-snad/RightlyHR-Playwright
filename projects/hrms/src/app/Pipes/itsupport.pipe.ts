import { Pipe, PipeTransform } from '@angular/core';
import { Ticket } from '../Interfaces/hierachy.modal';

@Pipe({
  name: 'itsupport'
})
export class ItsupportPipe implements PipeTransform {

    transform(active: Ticket[], searchValue: any): any[] {
      if((!active) || !searchValue){
        return active;
     }
     return active.filter(p =>
      p.assigneeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.employeeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.emailaddress?.toLowerCase().includes(searchValue.toLowerCase())||
      p.subject?.toLowerCase().includes(searchValue.toLowerCase())||
      p.workEmail?.toLowerCase().includes(searchValue.toLowerCase())||
       p.contactnumber?.toString().includes(searchValue.toLowerCase())||
       p.priority?.toString().toLowerCase().includes(searchValue.toLowerCase())||
       p.ticketStatus?.toString().toLowerCase().includes(searchValue.toLowerCase())||
       p.departmentName?.toString().toLowerCase().includes(searchValue.toLowerCase())||
       p.subdepartmentName?.toString().toLowerCase().includes(searchValue.toLowerCase())
      )
  
    }

}
