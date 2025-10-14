import { Pipe, PipeTransform } from '@angular/core';
import { Icontractapproval } from '../Interfaces/contract-module';


@Pipe({
  name: 'contractsearchfilter'
})
export class ContractsearchfilterPipe implements PipeTransform {

    transform(Traineeaprovalsearch: Icontractapproval[], searchValue: string):Icontractapproval[] {
       if ((!Traineeaprovalsearch) || !searchValue) {
         return Traineeaprovalsearch;
       }
       const lowerCaseSearchValue = searchValue.toLowerCase();
       return Traineeaprovalsearch.filter(record =>
         record.entity?.fusionEmpId?.toLowerCase().includes(lowerCaseSearchValue) ||
         record.entity?.employeeName?.toLowerCase().includes(lowerCaseSearchValue) ||
         record.entity?.contractStartDate?.toString().toLowerCase().includes(lowerCaseSearchValue) ||
         record.entity?.contractEndDate?.toLowerCase().includes(lowerCaseSearchValue)
       );
     }

}
