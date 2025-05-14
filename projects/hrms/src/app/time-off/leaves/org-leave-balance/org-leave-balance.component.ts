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

  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

  constructor(
      private http: HttpService,
      private modal: NgbModal,private authService: AuthService
    ) { }
    
  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
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
        // this.employeeiddetails = data as IemployeeDetails[];
        const employeedata = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''
              }${employee.firstName ? employee.firstName : '' } ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName ? employee.lastName : ''}`,
          };
        });
        this.employeeiddetails = employeedata.filter((element: any) => {
          return element.employeeId != loggedInUser.employeeId;
        });
        // this.employeeiddetailsauthorityName = data as IemployeeDetails[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
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
   Onclick($event: any) {
    console.log($event);
    
    if ($event.value) {
       this.employeedata = this.employeeiddetails.find((e:any)=>e.employeeId == $event.value);
       localStorage.setItem("onbehalfofaproverData", JSON.stringify(this.employeedata));
      this.http.triggerActionSignal();
    }
    else {
      this.employeedata = {};
      this.leaves = [];
      this.compOff = [];
      this.wfh = [];
      this.permissions = [];
      this.timeOffCount = 0;
      this.compOffCount = 0;
      this.wfhCount = 0;
      this.permissionsCount = 0;
      localStorage.setItem("onbehalfofaproverData", JSON.stringify(null));
      this.http.triggerActionSignal();
    }
  }
}
