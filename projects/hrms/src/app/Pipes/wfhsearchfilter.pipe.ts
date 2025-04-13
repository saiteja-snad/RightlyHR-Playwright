import { Pipe, PipeTransform } from '@angular/core';
import { AttendanceRequest } from '../Interfaces/timoff-model';

@Pipe({
  name: 'wfhsearchfilter',
})
export class WfhsearchfilterPipe implements PipeTransform {
  transform(
    active: AttendanceRequest[],
    searchValue: string
  ): AttendanceRequest[] {
    if (!active || !searchValue) {
      return active;
    }

    searchValue = searchValue.toLowerCase();

    return active.filter(
      (p) =>
        p.entity?.attendanceRequestFusionEmployeeId
          ?.toLowerCase()
          .includes(searchValue) ||
        p.entity?.attendanceRequesterName
          ?.toLowerCase()
          .includes(searchValue) ||
        p.entity?.attendanceRequestDurationType
          ?.toLowerCase()
          .includes(searchValue) 
    );
  }
}
