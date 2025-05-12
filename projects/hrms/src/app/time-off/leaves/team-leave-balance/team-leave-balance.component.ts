import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Select } from 'primeng/select';
import { LeavesApprovaltabsComponent } from "../../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component";
import { AccordionModule } from 'primeng/accordion';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IEmployeeLeaveData } from '../leaves.model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";

@Component({
  selector: 'app-team-leave-balance',
  imports: [CommonModule, Select, LeavesApprovaltabsComponent, AccordionModule, NoDataFoundComponent, DataLoaderContentComponent, FormsModule, DateformatPipe],
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
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('leavesModal') leavesModal!: TemplateRef<any>;

  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

  constructor(
    private http: HttpService,
    private modal: NgbModal
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
    const url = `Timeoff?EmployeeId=${employeeId}`;

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const filteredData = (res as any[]).filter(item => {
          const leaveYear = new Date(item.startdate).getFullYear();
          return item.categoryId === categoryId && leaveYear === yearToFilter;
        });

        console.log('Filtered Leaves for Category and Year:', filteredData);

        this.popupData = filteredData;
        this.popupType = category.category?.name;
        this.modal.open(this.leavesModal, { centered: true, backdrop: 'static' });
      },
      error: (err) => {
        console.error('Error fetching leave data:', err);
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
