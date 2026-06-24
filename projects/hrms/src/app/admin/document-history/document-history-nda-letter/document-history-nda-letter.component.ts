import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { INDALetterDetails } from '../../../Interfaces/documentsHistory';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { NdaletterPipe } from "../../../Pipes/ndaletter.pipe";
import { OnboardingFilterService } from '../../../shared/time-off-module-tabs/pending-approvals-tabs/onboarding-filter.service';
@Component({
  selector: 'app-document-history-nda-letter',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DateformatPipe, FormsModule,
    NoDataFoundComponent, DataLoaderContentComponent, DatePicker, NdaletterPipe, TableModule],
  templateUrl: './document-history-nda-letter.component.html',
  styleUrl: './document-history-nda-letter.component.scss'
})
export class DocumentHistoryNdaLetterComponent {
  @ViewChild('ndaLetterTable') ndaLetterTable!: Table;
  subscription!: Subscription;
  ndaLettersData = [] as INDALetterDetails[];
  searchValue: any;
  dataloader: boolean = false;
  selectedDate: Date = new Date();
  selectedMonth: number | null = null;
  selectedYear: number | null = null;
  maxMonth: Date = new Date();
  ndaLetters: any[] = [];
  originalNdaLetters = [] as INDALetterDetails[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private http: HttpService, public rbac: RbacService, private onboardingFilter: OnboardingFilterService) { }

  ngOnInit(): void {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
    this.getndaLettersData();
  }

  getndaLettersData() {
    this.dataloader = true;
    this.subscription = this.http.getData('NdaLetter/getAllNames').subscribe({
      next: (data: any) => {
        this.dataloader = false;
        this.ndaLettersData = data.data;
        this.originalNdaLetters = [...this.ndaLettersData];
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
      this.ndaLetters = this.ndaLettersData?.filter(item => {
        const date = moment(item.ndaSentDate);
        return date.month() + 1 === this.selectedMonth && date.year() === this.selectedYear;
      });
    } else {
      this.ndaLetters = this.ndaLettersData; // show all if no filter
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

  getFilteredAndSortedNdaLetters(): INDALetterDetails[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.ndaLetters;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.ndaLetters.filter((letter: INDALetterDetails) => {
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
        this.ndaLetters = [...this.originalNdaLetters];
        this.filterByMonth();
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.ndaLetterTable) {
          this.ndaLetterTable.reset();
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
      if (field === 'ndaSentDate') {
        val1 = new Date(a.ndaSentDate);
        val2 = new Date(b.ndaSentDate);
        return event.order * (val1.getTime() - val2.getTime());
      } else {
        // Handle string sorting for employee name
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}