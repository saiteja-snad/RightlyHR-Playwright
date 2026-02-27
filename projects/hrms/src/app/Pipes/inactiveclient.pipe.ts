import { Pipe, PipeTransform } from '@angular/core';
import { Client } from '../Interfaces/clients.model';

@Pipe({
  name: 'inactiveclient'
})
export class InactiveclientPipe implements PipeTransform {

  transform(active: Client[], searchValue: any): Client[] {
       if ((!active) || !searchValue) {
         return active;
       }

       const lowerSearch = searchValue.toLowerCase();
       return active.filter(p =>
         p.clientName?.toLowerCase().includes(lowerSearch) ||
         p.websiteUrl?.toLowerCase().includes(lowerSearch) ||
         p.taxId?.toLowerCase().includes(lowerSearch) ||
         p.industryType?.toString().includes(lowerSearch) ||
         p.createdBy?.name?.toString().includes(lowerSearch) ||
         p.status?.toLowerCase().includes(lowerSearch) ||
         p.contact?.email?.toLowerCase().includes(lowerSearch) ||
         p.contact?.role?.toLowerCase().includes(lowerSearch) ||
         p.contact?.phoneNumber?.toString().includes(lowerSearch) ||
         p.status?.toLowerCase().includes(lowerSearch) ||
         p.contact?.name?.toString().includes(lowerSearch)
      );
     }


}
