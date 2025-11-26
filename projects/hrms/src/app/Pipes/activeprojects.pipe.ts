import { Pipe, PipeTransform } from '@angular/core';
import { Project } from '../Interfaces/projects.model';



@Pipe({
  name: 'activeprojects'
})
export class ActiveprojectsPipe implements PipeTransform {

   transform(active: Project[], searchValue: any): Project[] {
       if ((!active) || !searchValue) {
         return active;
       }
   
       const lowerSearch = searchValue.toLowerCase();
       return active.filter(p =>
         p.projectName?.toLowerCase().includes(lowerSearch) ||
         p.client?.clientName?.toLowerCase().includes(lowerSearch) ||
         p.startDate?.toLowerCase().includes(lowerSearch) ||
         p.endDate?.toString().includes(lowerSearch) ||
         p.effectiveDate?.toString().includes(lowerSearch) ||
         p.kickoffDate?.toString().includes(lowerSearch) ||
         p.projectType?.toString().toLowerCase().includes(lowerSearch) ||
         p.status?.toLowerCase().includes(lowerSearch)
       );
     }

}
