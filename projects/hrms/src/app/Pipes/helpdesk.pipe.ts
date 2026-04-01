import { Pipe, PipeTransform } from '@angular/core';
import { Ticket } from '../Interfaces/hierachy.modal';
@Pipe({
  name: 'helpdesk'
})
export class HelpdeskPipe implements PipeTransform {

transform(tickets: any[], searchValue: string): any[] {

  if (!tickets) return [];
  if (!searchValue) return tickets;

  searchValue = searchValue.toLowerCase().trim();

  return tickets.filter(ticket => {

    const ticketId = ticket.id?.toString().toLowerCase();
    const displayId = `tkt - ${ticket.id}`.toLowerCase();

    return (
      ticketId?.includes(searchValue) ||

      displayId.includes(searchValue) ||

      ticket.category?.toLowerCase().includes(searchValue) ||

      ticket.subcategory?.toLowerCase().includes(searchValue) ||

      ticket.department?.toLowerCase().includes(searchValue) ||

      ticket.subject?.toLowerCase().includes(searchValue) ||

      ticket.status?.toLowerCase().includes(searchValue) ||

      ticket.priority?.toLowerCase().includes(searchValue) ||
      ticket.employeeName?.toLowerCase().includes(searchValue)
    );
  });
}
}

