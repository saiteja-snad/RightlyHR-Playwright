import { Pipe, PipeTransform } from '@angular/core';
import { Iglobalpermissions } from '../time-off/global-permissions/globalpermissions-modal';

@Pipe({
  name: 'globalpermissions'
})
export class GlobalpermissionsPipe implements PipeTransform {

 
   transform(active: Iglobalpermissions[], searchValue: any): Iglobalpermissions[] {
     if((!active) || !searchValue){
       return active;
    }
    return active.filter(p =>
     p.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
     p.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
     `${p.firstName?.toLowerCase()} ${p.lastName?.toLowerCase()}`.includes(searchValue.toLowerCase()) ||
     p.fusionEmpId?.toLowerCase().includes(searchValue.toLowerCase())||
      p.teamId_sublocIdName?.toString().includes(searchValue.toLowerCase())||
      p.location?.toString().includes(searchValue.toLowerCase())||
      p.sublocation?.toString().includes(searchValue.toLowerCase())||
      p.deptId_locationIdName?.toString().includes(searchValue.toLowerCase())||
      p.Department?.toString().includes(searchValue.toLowerCase())
     )
 
   }

}
