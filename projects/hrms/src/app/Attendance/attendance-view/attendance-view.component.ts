import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { Subscription, BehaviorSubject, Subject, filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ipersonal } from '../../Interfaces/members-model';
import { LeaveType, IPermissionsvalue } from '../../Interfaces/timoff-model';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { TohoursPipe } from '../../Pipes/tohours.pipe';
import { AuthService } from '../../services/auth.service';
import { FormValidationsService } from '../../services/form-validations.service';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { AddLeaveComponent } from '../../time-off/leaves/add-leave/add-leave.component';
import { IAttendance, IdayLogs } from './attendance-modal';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { AccordionModule } from 'primeng/accordion';
@Component({
  selector: 'app-attendance-view',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    Select,
    DataLoaderContentComponent,
    TohoursPipe,
    DatePicker,
    ModuleInformationComponent,
    InfoIconComponent,
    AccordionModule
],
  templateUrl: './attendance-view.component.html',
  styleUrl: './attendance-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class AttendanceViewComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  dataLoader = false;
  subscription!: Subscription;
  yearOptions = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
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
  attendanceData = new BehaviorSubject<IAttendance[]>([]);
  selectedYear: any;
  selectedMonth: any;
  selectedEmployee: any | null;
  selectedEmployeeOfHr: any | null;
  empdata = {} as Ipersonal;
  statusCounts$ = new BehaviorSubject<any[]>([]);
  shiftDetails = {} as any;
  currentMonth: any;
  currentYear: any;
  regularizationForm!: FormGroup;
  spinnerLoader = false;
  regularizationTypes: LeaveType[] = [] as LeaveType[];
  punchInData = [] as any;
  duration = [
    { name: 0.5, value: 0.5 },
    { name: 1, value: 1 },
    { name: 1.5, value: 1.5 },
    { name: 2, value: 2 },
  ];
  empName!: string | null;
  logsDuration!: string;
  totalDurationHours!: string;
  permissionsDuration!: string;
  regularizationAttendDuration!: string;
  regularizationValues = [] as IPermissionsvalue[];
  punchPairs = [] as IdayLogs[];
  selectedDate!: Date;
  getAllEmployeeInfo = [] as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  get_Employeelist_forTM = [] as any;
  permissions_list = [] as any;
  regularization_list = [] as any;
  currentDate: any;
  date!: Date;

  constructor(
    private authService: AuthService,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public modalService: NgbModal,
    public rbac: RbacService,
    private fb: FormBuilder,
    public formsValidation: FormValidationsService,
    public readonly router: Router
  ) {
  }

  ngOnInit(): void {
    // Get current date
    const now = moment().startOf('month'); // ← important!
    this.date = now.toDate();
    this.currentDate = moment().date();
    // Get current month (1-based)
    this.currentMonth = moment().month() + 1;
    this.selectedMonth = this.currentMonth;
    // Get current year
    this.currentYear = moment().year();
    this.selectedYear = this.currentYear;
    this.empdata = this.authService.getToken();
    this.getAttendnaceData(this.empdata);
    this.getAttendanceCriteria();
    this.getAllEmployeeDetails();
    this.getEmployeeDetails();
    this.initializeForm();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }


  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/attendance': MODULE_INFOS.ATTENDANCE_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  checkdates(Value: any) {
    if (Value) {
      const selectedDate = moment(Value);
      this.selectedYear = selectedDate.year();
      this.selectedMonth = selectedDate.month() + 1; // month() is 0-based
      this.getAttendnaceData(this.getSelectedEmployee());
    }
  }

  //function to check the date
  isPastOrToday(date: any): boolean {
    return moment(date).isBefore(moment(), 'day');
  }

  //function to inialize form
  initializeForm() {
    this.regularizationForm = this.fb.group({
      permissionDate: [{ value: null, disable: true }, Validators.required],
      duration: [null, Validators.required],
      leaveType: [null, Validators.required],
      reason: [null, [Validators.required,Validators.minLength(10), Validators.maxLength(250)]],
    });
    this.getDuration();
  }

  //function to open modal
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openModalLarge(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }
//function to get the attendance criteria
  getAttendanceCriteria() {
    const params = 'AttendanceRegularization';
    const param = [
      'maxRegularizePerDay',
      'maxRegularizePerMonth',
      'maxRegularizeHoursPerDay',
      'maxRegularizeHoursPerMonth',
    ];
    this.subscription = this.http
      .getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param)
      .subscribe({
        next: (data: any) => {
          this.regularizationValues = data as IPermissionsvalue[];
          const maxHoursConfig = this.regularizationValues?.find(
            (item) => item.attribute === 'maxRegularizeHoursPerDay'
          );
          const maxHours = maxHoursConfig
            ? parseFloat(maxHoursConfig.value)
            : 2; // default to 2 if not found
          this.duration = [];
          for (let i = 0.5; i <= maxHours; i += 0.5) {
            this.duration.push({ name: i, value: i });
          }
        },
        error: (err) => {
          console.log('errors', err);
        },
      });
  }

  //function to get the day logs
  dayLogsData(
    Value: any,
    date: Date,
    totalduration: any,
    permissions: any,
    regularizations: any
  ) {
    this.logsDuration = totalduration;
    this.selectedDate = date;
    this.permissions_list = permissions;
    this.regularization_list = regularizations;
    if (Value) {
      this.punchPairs = Value;
    } else {
      this.punchPairs = [];
    }
  }

  //function to get the regularization types
  getDuration() {
    this.subscription = this.http
      .getData(`PermissionTypes?type=${'Regularization'}`)
      .subscribe({
        next: (response: any) => {
          this.regularizationTypes = response;
        },
      });
  }

  //function to post the regularization
  applyRgularization(regularizationForm: FormGroup) {
    if (regularizationForm.valid) {
      const formData = regularizationForm.value;
      const payLoad = {
        raisedFor: this.empdata.employeeId,
        requestedBy: this.empdata.employeeId,
        requestedDate: formData.permissionDate,
        createdDate: moment().format('YYYY-MM-DD'), // current date
        type: formData.leaveType.name,
        status: 'Waiting for Approval',
        referenceTypeId: formData.leaveType.id,
        duration: formData.duration.value.toString(),
        notes: formData.reason,
        processedComment: formData.processedComment,
        moduleId: environment.attendanceRegularizationModuleId,
      };
      this.spinnerLoader = true;
      this.http
        .postData('RegularizationRequests/create', payLoad, {
          responseType: 'text',
        })
        .subscribe({
          next: (res: any) => {
            // this.getCompOffRequest();
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(
              'Request submitted successfully'
            );
            this.regularizationForm.reset();
          },
          error: (err: any) => {
            this.spinnerLoader = false;
            console.error(err);
            this.conformationPopup.openErrorModal(err.error);
          },
          complete: () => {
            this.spinnerLoader = false;
            this.regularizationForm.reset();
          },
        });
    }
  }

  navigateToLeave(data: any) {
    const modalRef = this.modalService.open(AddLeaveComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.updateData = data;
  }

  onclickDuration(
    durationPopup: any,
    duration: string,
    totalDurationHours: string,
    permissionduration: string,
    regularizationduration: string
  ) {
    this.openModal(durationPopup);
    (this.logsDuration = duration),
      (this.totalDurationHours = totalDurationHours),
      (this.permissionsDuration = permissionduration),
      (this.regularizationAttendDuration = regularizationduration);
  }

  getSelectedEmployee() {
    return this.selectedEmployee || this.selectedEmployeeOfHr || this.empdata;
  }

  //function to get the attendance data
  getAttendnaceData(employee: any) {
    this.dataLoader = true;
    const employeeId = employee.employeeId;
    this.empName = `${employee.fusionEmpId ?? ''} - ${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''
      }${employee.lastName ? ' ' + employee.lastName : ''}`;
    this.subscription = this.http
      .getData(
        `v2/AttendanceData/employee/${employeeId}?year=${this.selectedYear}&month=${this.selectedMonth}`
      )
      .subscribe({
        next: (response: any) => {
          this.dataLoader = false;
          const updatedAttendanceData = response.data.attendanceData.map(
            (item: any) => ({
              ...item,
              employeeId: response.data.employeeId,
            })
          );
          this.attendanceData.next(updatedAttendanceData);
          this.statusCounts$.next(response.data.summary);
          this.shiftDetails = response.data.shiftDetails;
          // this.attendanceData.next(response.data);
        },
        error: (err: any) => {
          this.dataLoader = false;
          console.log(err);
          this.attendanceData.next([]);
          this.statusCounts$.next([]);
          this.shiftDetails = {};
        },
        complete: () => {
          this.dataLoader = false;
        },
      });
  }
getStatusClass(color:any){
return color
}
  //function to bind color for the each status
  // getStatusClass(status: string): string {
  //   switch (status?.toLowerCase()) {
  //     case 'present':
  //       return 'status-present';
  //     case 'half day present':
  //       return 'status-halfdaypresent';
  //     case 'absent':
  //     case 'absent(permission)':
  //       return 'status-absent';
  //     case 'leave':
  //       return 'status-leave';
  //     case 'half day leave':
  //       return 'status-leave';
  //     case 'first half leave':
  //       return 'status-leave';
  //     case 'second half leave':
  //       return 'status-leave';
  //     case 'wfh':
  //       return 'status-wfh';
  //     case 'first half wfh':
  //       return 'status-wfh';
  //     case 'second half wfh':
  //       return 'status-wfh';
  //     case 'half day wfh':
  //       return 'status-wfh';
  //     case 'compoff':
  //       return 'status-compoff';
  //     case 'holiday':
  //       return 'status-holiday';
  //     case 'weekend':
  //       return 'status-weekend';
  //     case 'half day remote':
  //       return 'status-remote';
  //     case 'half day':
  //       return 'status-halfday';
  //     case 'norecords':
  //       return 'status-norecords';
  //     default:
  //       return '';
  //   }
  // }

  // function to get the data of employees by hierarchy
  getAllEmployeeDetails() {
    // let EmployeeId=this.employeeId;
    const satus = ['active', 'Trainee Active'];
    this.subscription = this.http
      .getData(`Employeedata/Getallemployees?statuses=${satus}`)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.getAllEmployeeInfo = response
              .filter(
                (employee: any) =>
                  employee.employeeId !== this.empdata.employeeId
              )
              .map((employee: any) => {
                return {
                  ...employee,
                  fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                    }${employee.firstName??''} ${employee.middleName ? employee.middleName + ' ' : ''
                    }${employee.lastName}`,
                };
              });
          }
        },
      });
  }

  onclickRegularization(date: Date) {
    this.regularizationForm.patchValue({
      permissionDate: date,
    });
  }

  // function to get the data of employees by hierarchy
  getEmployeeDetails() {
    const EmployeeId = this.empdata.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          if (response) {
            const myTeam = response.filter((e: any) => e.isAccess);
            this.get_Employeelist_forTM = myTeam.map((employee: any) => {
              return {
                ...employee,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                  }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                  }${employee.lastName}`,
              };
            });
          }
        },
      });
  }
  
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}