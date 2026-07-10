import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { FormsModule } from '@angular/forms';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { ITeamLeaveSummary } from '../../time-off/leaves/leaves.model';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../shared/reports-tabs/reports-header/reports-header.component";
import { TableModule, Table } from 'primeng/table';
@Component({
  selector: 'app-team-leave-summary',
  imports: [CommonModule, Select, DataLoaderContentComponent, NoDataFoundComponent, FormsModule, DateformatPipe, NgbPopoverModule, ReportsHeaderComponent, TableModule],
  templateUrl: './team-leave-summary.component.html',
  styleUrl: './team-leave-summary.component.scss'
})

export class TeamLeaveSummaryComponent {
  @ViewChild('dt') dt!: Table;
  sortedData: ITeamLeaveSummary[] = [];
  teamLeaveSummary: ITeamLeaveSummary[] = [];
  loggedInUser: any;
  selectedYear: number | undefined;
  activeIndex: number = 0;
  dataload = false;
  popupData: any[] = [];
  popupType: string = '';
  selectedMonth: any;
  searchText: string = '';
  filteredTeamLeaveSummary: any[] = [];
  selectedEmployee: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  originalTeamLeaveSummary: ITeamLeaveSummary[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;
  // year
  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];
  // Months
  monthOptions = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 },
  ];
  readonly DISPLAY_LABEL_MAP: Record<string, string> = {
    'leaves': 'Leaves',
    'wfh': 'WFH',
    'permissions': 'Permission',
    'regularization': 'Regularization'
  };

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const currentDate = new Date();
    this.selectedMonth = currentDate.getMonth() + 1;
    this.selectedYear = currentDate.getFullYear();
    this.getAllTeamLeaveSummary();
  }

  getAllTeamLeaveSummary() {
    this.dataload = true;
    const employeeId = this.loggedInUser.employeeId;
    let url = `Employeedata/v1/getreportessdata?employeeId=${employeeId}`;
    if (this.selectedYear) {
      url += `&year=${this.selectedYear}`;
    }
    if (this.selectedMonth) {
      url += `&month=${this.selectedMonth}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.teamLeaveSummary = res;
        this.filteredTeamLeaveSummary = res;
        this.originalTeamLeaveSummary = [...res];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.sortedData = [];
      },
      error: () => {
        this.dataload = false;
        this.teamLeaveSummary = [];
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }

  filterTeamLeaveSummary() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.filteredTeamLeaveSummary = this.teamLeaveSummary;
      return;
    }
    this.filteredTeamLeaveSummary = this.teamLeaveSummary.filter(item => {
      const name = item.employeeName?.toLowerCase() || '';
      const fusionId = item.fusionEmpId?.toLowerCase() || '';
      return name.includes(term) || fusionId.includes(term);
    });
  }

  onSelectYear(event: any) {
    this.selectedYear = event.value;
    this.getAllTeamLeaveSummary();
  }

  onSelectMonth(event: any) {
    this.selectedMonth = event.value;
    this.getAllTeamLeaveSummary();
  }

  openPopup(content: any, employee: any, type: 'leaves' | 'wfh' | 'permissions' | 'regularization') {
    this.selectedEmployee = employee;
    const actualKey = this.DISPLAY_LABEL_MAP[type];
    this.popupData = employee[type] || [];
    this.popupType = actualKey;
    this.openModal(content);
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }

  calculateDuration(entries: any[]): number {
    if (!entries || !Array.isArray(entries)) return 0;
    return entries.reduce((sum, item) => sum + parseFloat(item.duration || 0), 0);
  }

  onSortChange(event: any): void {
    this.sortedData = this.dt?.filteredValue ?? this.dt?.value ?? this.filteredTeamLeaveSummary;
  }

  customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.filteredTeamLeaveSummary = [...this.originalTeamLeaveSummary];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.dt) this.dt.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = a[field];
      let val2 = b[field];

      // Handle fusionEmpId numeric sorting
      if (field === 'fusionEmpId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      // Handle numeric fields (leaves count, wfh count, etc.)
      if (field === 'leavesCount' || field === 'wfhCount') {
        const count1 = val1?.length || 0;
        const count2 = val2?.length || 0;
        return event.order * (count1 - count2);
      }

      // Handle calculated duration fields (permissions, regularization)
      if (field === 'permissionsDuration' || field === 'regularizationDuration') {
        const duration1 = this.calculateDuration(a[field === 'permissionsDuration' ? 'permissions' : 'regularization']);
        const duration2 = this.calculateDuration(b[field === 'permissionsDuration' ? 'permissions' : 'regularization']);
        return event.order * (duration1 - duration2);
      }

      // String sorting (default)
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}