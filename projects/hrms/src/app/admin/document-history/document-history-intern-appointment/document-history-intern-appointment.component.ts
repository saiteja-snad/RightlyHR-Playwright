import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IAppointmentLetterDetails } from '../../../Interfaces/documentsHistory';
import { AppointmentletterpipePipe } from '../../../Pipes/appointmentletterpipe.pipe';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-document-history-intern-appointment',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DateformatPipe, FormsModule, AppointmentletterpipePipe],
  templateUrl: './document-history-intern-appointment.component.html',
  styleUrl: './document-history-intern-appointment.component.scss'
})
export class DocumentHistoryInternAppointmentComponent implements OnInit,OnDestroy {
subscription!: Subscription;
  AppointmentLetters = [] as IAppointmentLetterDetails[];
  searchValue: any;

  constructor(private http: HttpService) { }


  ngOnInit(): void {
    this.getAppointmentLetters();
  }

  getAppointmentLetters() {
    this.subscription = this.http.getData('TraineeAppointmentLetter/getAllNames').subscribe({
      next: (data: any) => {
        this.AppointmentLetters = data;
      }
    });
  }

  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl).subscribe({
      next: (res: any) => {
        let fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.documentUrl.split('/')[file.documentUrl.split('/').length - 1];
        a.download = filename;
        a.click();
      },
      error: (reason) => console.log(reason),
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
