import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IAppointmentLetterDetails } from '../../../Interfaces/documentsHistory';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AppointmentletterpipePipe } from '../../../Pipes/appointmentletterpipe.pipe';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { OnboardingFilterService } from '../../../shared/time-off-module-tabs/pending-approvals-tabs/onboarding-filter.service';
@Component({
  selector: 'app-document-history-appointment-letter',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DateformatPipe, FormsModule, AppointmentletterpipePipe, 
    NoDataFoundComponent, DataLoaderContentComponent, DatePicker, DownloadIconComponent, TableModule],
  templateUrl: './document-history-appointment-letter.component.html',
  styleUrl: './document-history-appointment-letter.component.scss',
})

export class DocumentHistoryAppointmentLetterComponent implements OnInit, OnDestroy {
  @ViewChild('appointmentLetterTable') appointmentLetterTable!: Table;
  subscription!: Subscription;
  AppointmentLetters = [] as IAppointmentLetterDetails[];
  searchValue: any;
  dataloader: boolean = false;
  selectedDate: Date = new Date();
  selectedMonth: number | null = null;
  selectedYear: number | null = null;
  maxMonth: Date = new Date();
  offerLetters: any[] = [];
  originalAppointmentLetters = [] as IAppointmentLetterDetails[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private http: HttpService, public rbac: RbacService,private onboardingFilter: OnboardingFilterService){ }

  ngOnInit(): void {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1; 
    this.selectedYear = today.getFullYear();
    this.getAppointmentLetters();
  }

  getAppointmentLetters() {
    this.dataloader = true;
    this.subscription = this.http.getData('AppointmentLetter/getAllNames').subscribe({
      next: (data: any) => {
        this.dataloader = false;
        this.AppointmentLetters = data;
        this.originalAppointmentLetters = [...this.AppointmentLetters];
        this.filterByMonth();
      },
      error: (error: any) => {
        this.dataloader = false;
        console.error('Error fetching appointment letters:', error);
      },
      complete: () => {
        this.dataloader = false;
      }
    });
  }

  filterByMonth() {
    if (this.selectedMonth && this.selectedYear) {
      this.offerLetters = this.AppointmentLetters.filter(item => {
        const date = moment(item.appointmentSentDate);
        return date.month() + 1 === this.selectedMonth && date.year() === this.selectedYear;
      });
    } else {
      this.offerLetters = this.AppointmentLetters; // show all if no filter
    }
        // this.onboardingFilter.setMonthYear(this.selectedMonth || new Date().getMonth() + 1, this.selectedYear || new Date().getFullYear());

  }

  onMonthChange(value: any) {
    const selected = moment(value);
    this.selectedMonth = selected.month() + 1;
    this.selectedYear = selected.year();
    this.filterByMonth();
     this.onboardingFilter.setMonthYear(this.selectedMonth, this.selectedYear);
  }

  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl).subscribe({
      next: (res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        const filename = this.getDownloadFileName(res?.headers?.get('content-disposition'), file?.documentUrl);
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(a.href);
      },
      error: (reason) => console.log(reason),
    });
  }

  getFilteredAndSortedAppointmentLetters(): IAppointmentLetterDetails[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.offerLetters;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.offerLetters.filter((letter: IAppointmentLetterDetails) => {
      const employeeName = letter.employeeName?.toLowerCase() || '';
      
      return employeeName.includes(searchTerm);
    });
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.offerLetters = [...this.originalAppointmentLetters];
        this.filterByMonth();
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.appointmentLetterTable) {
          this.appointmentLetterTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle different field types
      if (field === 'appointmentSentDate') {
        val1 = new Date(a.appointmentSentDate);
        val2 = new Date(b.appointmentSentDate);
        return event.order * (val1.getTime() - val2.getTime());
      } else {
        // Handle string sorting for employee name
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }
  private getDownloadFileName(contentDisposition: string | null, documentUrl?: string): string {
    const fileNameFromHeader = this.extractFileNameFromContentDisposition(contentDisposition);
    if (fileNameFromHeader) {
      return fileNameFromHeader;
    }

    if (typeof documentUrl === 'string' && documentUrl.trim()) {
      const normalizedUrl = documentUrl.split('?')[0];
      const pathParts = normalizedUrl.split('/').filter(Boolean);
      const lastPathPart = pathParts[pathParts.length - 1];
      if (lastPathPart) {
        return decodeURIComponent(lastPathPart);
      }
    }

    return 'document';
  }

  private extractFileNameFromContentDisposition(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
      return decodeURIComponent(utfMatch[1].replace(/["']/g, '').trim());
    }

    const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (standardMatch?.[1]) {
      return standardMatch[1].trim();
    }

    return null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
}
