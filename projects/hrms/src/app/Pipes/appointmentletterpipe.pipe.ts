import { Pipe, PipeTransform } from '@angular/core';
import { IAppointmentLetterDetails } from '../interfaces/documentsHistory';

@Pipe({
  name: 'appointmentletterpipe'
})
export class AppointmentletterpipePipe implements PipeTransform {

  transform(probation: IAppointmentLetterDetails[], searchValue: any): IAppointmentLetterDetails[] {
    if ((!probation) || !searchValue) {
      return probation;
    }
    return probation.filter(p =>
      p.employeeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.appointmentSentDate?.toString().includes(searchValue)
    )
  }

}
