import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IAppointmentLetterDetails } from '../../../Interfaces/documentsHistory';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AppointmentletterpipePipe } from '../../../Pipes/appointmentletterpipe.pipe';
@Component({
  selector: 'app-document-history-appointment-letter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    DateformatPipe,
    FormsModule,
    AppointmentletterpipePipe,
  ],
  templateUrl: './document-history-appointment-letter.component.html',
  styleUrl: './document-history-appointment-letter.component.scss',
})
export class DocumentHistoryAppointmentLetterComponent
  implements OnInit, OnDestroy
{
  subscription!: Subscription;
  AppointmentLetters = [] as IAppointmentLetterDetails[];
  searchValue: any;

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.getAppointmentLetters();
  }

  getAppointmentLetters() {
    this.subscription = this.http
      .getData('AppointmentLetter/getAllNames')
      .subscribe({
        next: (data: any) => {
          this.AppointmentLetters = data;
        },
      });
  }

  onSelectDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl)
      .subscribe({
        next: (res: any) => {
          let fileName = res.headers
            .get('content-disposition')
            ?.split(':')[1]
            .split('=')[1];
          let blob: Blob = res.body as Blob;
          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename =
            file.documentUrl.split('/')[file.documentUrl.split('/').length - 1];
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
