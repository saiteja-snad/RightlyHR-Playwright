import { Pipe, PipeTransform } from '@angular/core';
import { IProbationEmployees } from '../Interfaces/letters-model';

@Pipe({
  name: 'probationpipe'
})
export class ProbationpipePipe implements PipeTransform {

  transform(active: IProbationEmployees[], searchValue: any): IProbationEmployees[] {
        if((!active) || !searchValue){
          return active;
       }
       return active.filter(p =>
        p.lastName?.toString().includes(searchValue) ||
        p.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.fusionEmpId?.toLowerCase().includes(searchValue.toLowerCase())
        )
    
      }
  

}
