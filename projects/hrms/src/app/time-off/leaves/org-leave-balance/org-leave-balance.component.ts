import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IEmployeeLeaveData } from '../leaves.model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { LeavesApprovaltabsComponent } from '../../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { FormControl, FormsModule } from '@angular/forms';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-org-leave-balance',
  imports: [CommonModule, Select, AccordionModule, LeavesApprovaltabsComponent, AccordionModule, NoDataFoundComponent, DataLoaderContentComponent, FormsModule, DateformatPipe],
  templateUrl: './org-leave-balance.component.html',
  styleUrl: './org-leave-balance.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class OrgLeaveBalanceComponent {
  subscription!: Subscription;
  employeedata = {} as any;
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
  employeeiddetails = [] as any;
  leaves = [] as any;
  compOff = [] as any;
  wfh = [] as any;
  permissions = [] as any;
  teamManagerControl = new FormControl(null);
  timeOffCount = 0;
  compOffCount = 0;
  wfhCount = 0;
  permissionsCount = 0;
  @ViewChild('leavesModal') leavesModal!: TemplateRef<any>;
  selectedEmployeeId: string | null = null;
  displaytable=false;

  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

  constructor(
    private http: HttpService,
    private modal: NgbModal, private authService: AuthService,private router: Router,
  ) { }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    localStorage.removeItem("onbehalfofaproverData");
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear();
    this.getEmployeeId();
    this.getAllTeamLeaveBalance();
  }

  onSelectYear(event: any) {
    this.selectedYear = event.value;
    this.getAllTeamLeaveBalance();
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http.getData('PendingApprovalsAuthority/getAll').subscribe({
      next: (data: any) => {
        const employeedata = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''
              }${employee.firstName ? employee.firstName : ''} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName ? employee.lastName : ''}`,
          };
        });
        this.employeeiddetails = employeedata.filter((element: any) => {
          return element.employeeId != loggedInUser.employeeId;
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllTeamLeaveBalance(employeeId?: string) {
    const id = employeeId || this.loggedInUser.employeeId;

    let url = `LeaveEntitlements/team-leave-entitlements/${id}`;
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
          this.filteredTeamLeaveBalance = [];
          this.activeIndex = -1;
        }
      },
      error: (err) => {
        this.displaytable=false;
        console.error('Error fetching leave balance:', err);
        this.dataload = false
        this.teamLeaveBalance = [];
        this.filteredTeamLeaveBalance = [];
        this.activeIndex = -1;
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }

  // Onclick($event: any) {
  //   this.displaytable=true;
  //   this.selectedEmployeeId = $event?.value || null;

  //   if (this.selectedEmployeeId) {
  //     this.employeedata = this.employeeiddetails.find((e: any) => e.employeeId == this.selectedEmployeeId);
  //     localStorage.setItem("onbehalfofaproverData", JSON.stringify(this.employeedata));
  //     this.getAllTeamLeaveBalance(this.selectedEmployeeId);
  //   } else {
  //     this.employeedata = {};
  //     localStorage.setItem("onbehalfofaproverData", JSON.stringify(null));
  //     this.filteredTeamLeaveBalance = [];
  //   }

  //   this.http.triggerActionSignal();
  // }

  Onclick($event: any) {
  const selectedId = $event?.value;

  if (selectedId) {
    this.displaytable = true;
    this.selectedEmployeeId = selectedId;
    this.employeedata = this.employeeiddetails.find((e: any) => e.employeeId == selectedId);
    localStorage.setItem("onbehalfofaproverData", JSON.stringify(this.employeedata));
    this.getAllTeamLeaveBalance(selectedId);
  } else {
    // If cleared
    this.selectedEmployeeId = null;
    this.employeedata = {};
    this.displaytable = false;
    this.teamLeaveBalance = [];
    this.filteredTeamLeaveBalance = [];
    localStorage.setItem("onbehalfofaproverData", JSON.stringify(null));
  }

  this.http.triggerActionSignal();
}

  trackByEmployeeId(index: number, employee: any): string {
    return employee?.employeeBasicDetails?.employeeId;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }


  onClickCategory(employee: any, category: any) {
    const employeeId = employee.employeeBasicDetails.employeeId;
    const categoryId = category.category?.id;
    const yearToFilter = this.selectedYear || new Date().getFullYear();
    const url = `Timeoff?EmployeeId=${employeeId}`;

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        console.log('Leave data:', res);
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

  navigateTimeoff() {
    this.router.navigate(['/time-off/leaves/waiting-for-approval'])
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
