import { Component, TemplateRef, ViewChild } from '@angular/core';
import { LeavesApprovaltabsComponent } from "../../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component";
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { ITeamLeaveSummary } from '../leaves.model';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";

@Component({
  selector: 'app-team-leave-summary',
  imports: [LeavesApprovaltabsComponent, CommonModule, Select, DataLoaderContentComponent, NoDataFoundComponent, FormsModule, DateformatPipe],
  templateUrl: './team-leave-summary.component.html',
  styleUrl: './team-leave-summary.component.scss'
})
export class TeamLeaveSummaryComponent {
  teamLeaveSummary: ITeamLeaveSummary[] = [];
  loggedInUser: any;
  selectedYear: number | undefined;
  activeIndex: number = 0;
  dataload = false;
  popupData: any[] = [];
  popupType: string = '';
  selectedMonth: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

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

  readonly TYPE_MAP: Record<string, string> = {
    'Leaves': 'leaves',
    'WFH': 'wfh',
    'Permission': 'permissions',
    'Regularization': 'regularization'
  };

  constructor(
    private http: HttpService,
    private modalService: NgbModal
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
      },
      error: (err) => {
        this.dataload = false;
        this.teamLeaveSummary = [];
      },
      complete: () => {
        this.dataload = false;
      }
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

  openPopup(content: any, employee: any, type: 'Leaves' | 'WFH' | 'Permission' | 'Regularization') {
    const actualKey = this.TYPE_MAP[type];
    this.popupData = employee[actualKey] || [];
    this.popupType = type;
    this.openModal(content);    
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  calculateDuration(entries: any[]): number {
    if (!entries || !Array.isArray(entries)) return 0;
    return entries.reduce((sum, item) => sum + parseFloat(item.duration || 0), 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
