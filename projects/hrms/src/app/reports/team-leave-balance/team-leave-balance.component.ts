import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Select } from 'primeng/select';
import { IEmployeeLeaveData } from '../../time-off/leaves/leaves.model';
import { AccordionModule } from 'primeng/accordion';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { FormsModule } from '@angular/forms';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-team-leave-balance',
  imports: [CommonModule, Select, AccordionModule, NoDataFoundComponent, DataLoaderContentComponent, FormsModule, DateformatPipe, NgbPopoverModule],
  templateUrl: './team-leave-balance.component.html',
  styleUrl: './team-leave-balance.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class TeamLeaveBalanceComponent implements OnInit, OnDestroy {
  teamLeaveBalance: IEmployeeLeaveData[] = [];
  loggedInUser: any;
  selectedYear: number | undefined;
  activeIndex: number = 0;
  dataload = false;
  popupData: any[] = [];
  popupType: string = '';
  searchText: string = '';
  filteredTeamLeaveBalance: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('leavesModal') leavesModal!: TemplateRef<any>;
  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

  constructor(
    private http: HttpService,
    private modal: NgbModal,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear();
    this.getAllTeamLeaveBalance();
  }

  onSelectYear(event: any) {
    this.selectedYear = event.value;
    this.getAllTeamLeaveBalance();
  }

  getAllTeamLeaveBalance() {
    this.dataload = true;
    const employeeId = this.loggedInUser.employeeId;
    let url = `LeaveEntitlements/team-leave-entitlements/${employeeId}`;
    if (this.selectedYear) {
      url += `?year=${this.selectedYear}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.teamLeaveBalance = res.data;
          this.filteredTeamLeaveBalance = res.data;
          this.activeIndex = 0;
        } else {
          this.dataload = false
          this.teamLeaveBalance = [];
          this.activeIndex = -1;
        }
      },
      error: (err) => {
        this.dataload = false;
        this.activeIndex = -1;
        this.teamLeaveBalance = [];
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }

  onAccordionChange(event: any) {
    this.activeIndex = event.index;
  }

  onClickCategory(employee: any, category: any) {
    const employeeId = employee.employeeBasicDetails.employeeId;
    const categoryId = category.category?.id;
    const yearToFilter = this.selectedYear || new Date().getFullYear();
    const url = `Timeoff/${employeeId}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const filteredData = (res as any[]).filter(item => {
          const leaveYear = new Date(item.startdate).getFullYear();
          return item.categoryId === categoryId && leaveYear === yearToFilter;
        });
        this.popupData = filteredData;
        this.popupType = category.category?.name;
        this.modal.open(this.leavesModal, { centered: true, backdrop: 'static', size: 'lg' });
      },
      error: (err) => {
        console.error('Error fetching leave data:', err);
      }
    });
  }

  filterTeamLeaveSummary() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.filteredTeamLeaveBalance = this.teamLeaveBalance;
      return;
    }
    this.filteredTeamLeaveBalance = this.teamLeaveBalance.filter(item => {
      const name = item.employeeBasicDetails.employeeName?.toLowerCase() || '';
      const fusionId = item.employeeBasicDetails.snadEmployeeId?.toLowerCase() || '';
      return name.includes(term) || fusionId.includes(term);
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