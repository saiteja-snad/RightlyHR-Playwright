import { Pipe, PipeTransform } from '@angular/core';
import { Itraineeapproval } from '../Interfaces/traineedetails.model';

@Pipe({
  name: 'traineesearchfilter'
})
export class TraineesearchfilterPipe implements PipeTransform {

  transform(Traineeaprovalsearch: Itraineeapproval[], searchValue: string):Itraineeapproval[] {
     if ((!Traineeaprovalsearch) || !searchValue) {
       return Traineeaprovalsearch;
     }
     const lowerCaseSearchValue = searchValue.toLowerCase();
     return Traineeaprovalsearch.filter(record =>
       record.entity?.fusionEmpId?.toLowerCase().includes(lowerCaseSearchValue) ||
       record.entity?.empName?.toLowerCase().includes(lowerCaseSearchValue) ||
       record.entity?.traineeStartDate?.toString().toLowerCase().includes(lowerCaseSearchValue) ||
       record.entity?.traineeEndDate?.toLowerCase().includes(lowerCaseSearchValue)
     );
   }
}
