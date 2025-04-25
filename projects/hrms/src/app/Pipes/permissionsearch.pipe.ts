import { Pipe, PipeTransform } from '@angular/core';
import { PermissionRequestResponse } from '../Interfaces/timoff-model';

@Pipe({
  name: 'permissionsearch'
})
export class PermissionsearchPipe implements PipeTransform {

  transform(
      active: PermissionRequestResponse[],
      searchValue: string
    ): PermissionRequestResponse[] {
      console.log(searchValue);
      
      if (!active || !searchValue) {
        return active;
      }
  
      searchValue = searchValue.toLowerCase();
  
      return active.filter(
        (p) =>
          p.entity?.fusionempId
            ?.toLowerCase()
            .includes(searchValue) ||
          p.entity?.raisedForName
            ?.toLowerCase()
            .includes(searchValue) ||
          p.entity?.type
            ?.toLowerCase()
            .includes(searchValue) 
      );
    }

}
