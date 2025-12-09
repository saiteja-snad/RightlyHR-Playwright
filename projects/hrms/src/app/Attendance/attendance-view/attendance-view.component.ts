import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
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
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { MODULE_INFOS } from '../../shared/modules-info';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { AccordionModule } from 'primeng/accordion';
import { ChartModule } from 'primeng/chart';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';

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
    ModuleInfoIconComponent,
    Select,
    DataLoaderContentComponent,
    TohoursPipe,
    DatePicker,
    ModuleInformationComponent,
    InfoIconComponent,
    AccordionModule,
    ChartModule,
  ],
  templateUrl: './attendance-view.component.html',
  styleUrl: './attendance-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AttendanceViewComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
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
  breakDuration!: string;
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
  extra_logs = [] as any;
  regularization_list = [] as any;
  currentDate: any;
  date!: Date;
  attendanceSummaryData: any;
  attendanceSummaryOptions: any;
  maxMonth: Date = new Date();
  extraHoursForm!: FormGroup;
  selectedDateTotalDuration: string = '00:00:00';

  constructor(
    private authService: AuthService,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public modalService: NgbModal,
    public rbac: RbacService,
    private fb: FormBuilder,
    public formsValidation: FormValidationsService,
    public readonly router: Router
  ) {}

  ngOnInit(): void {
    // Get current date
    const now = moment().startOf('month');
    this.date = now.toDate();
    this.currentDate = moment().date();
    // Get current month (1-based)
    this.currentMonth = moment().month() + 1;
    this.selectedMonth = this.currentMonth;
    // Get current year
    this.currentYear = moment().year();
    this.selectedYear = this.currentYear;
    this.maxMonth = new Date();
    this.empdata = this.authService.getToken();
    this.getAttendnaceData(this.empdata);
    this.getAttendanceCriteria();
    this.getAllEmployeeDetails();
    this.getEmployeeDetails();
    this.initializeForm();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.initliazeExtraHoursForm();
    this.getdatabyentriy();
  }

  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }

  updateModuleInfo() {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthName = monthNames[this.selectedMonth - 1];
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/attendance': MODULE_INFOS.getAttendanceModuleInfo(
        monthName,
        this.selectedYear
      ),
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) =>
      url.includes(route)
    );
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
      permissionDate: [{ value: null, disabled: true }, Validators.required],
      duration: [null, Validators.required],
      leaveType: [null, Validators.required],
      reason: [
        null,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(250),
        ],
      ],
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
  maxPastDaysAllowed: any;
  //function to get the attendance criteria
  getAttendanceCriteria() {
    const params = 'AttendanceRegularization';
    const param = [
      'maxRegularizePerDay',
      'maxRegularizePerMonth',
      'maxRegularizeHoursPerDay',
      'maxRegularizeHoursPerMonth',
      'pastDaysAllowed',
    ];
    this.subscription = this.http
      .getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param)
      .subscribe({
        next: (data: any) => {
          this.regularizationValues = data as IPermissionsvalue[];
          const pastDaysAllowedConfig = this.regularizationValues?.find(
            (item: any) => item.attribute === 'pastDaysAllowed'
          );
          this.maxPastDaysAllowed = pastDaysAllowedConfig
            ? parseFloat(pastDaysAllowedConfig.value)
            : undefined;
          console.log(this.maxPastDaysAllowed, 'maxPastDaysAllowed');
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

  isWithinPastDaysAllowed(date: Date | string): boolean {
    if (this.maxPastDaysAllowed === undefined) return false;
    const today = new Date();
    const selected = new Date(date);
    // Calculate the difference in days
    const diff = Math.floor(
      (today.getTime() - selected.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff <= this.maxPastDaysAllowed && diff >= 0;
  }

  //function to get the day logs
  dayLogsData(
    Value: any,
    date: Date,
    totalduration: any,
    permissions: any,
    logExtraHours: any,
    regularizations: any,
    permissionduration: any,
    regularizationduration: any,
    breakDuration: any
  ) {
    this.logsDuration = totalduration;
    this.breakDuration = breakDuration;
    this.permissionsDuration = permissionduration;
    this.regularizationAttendDuration = regularizationduration;
    this.selectedDate = date;
    this.permissions_list = permissions;
    this.extra_logs = logExtraHours;
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
      const formData = regularizationForm.getRawValue();
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
              'Regularization request submitted successfully'
            );
            this.regularizationForm.reset();
            this.getAttendnaceData(this.getSelectedEmployee());
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
    this.empName = `${employee.fusionEmpId ?? ''} - ${employee.firstName}${
      employee.middleName ? ' ' + employee.middleName : ''
    }${employee.lastName ? ' ' + employee.lastName : ''}`;
    this.subscription = this.http
      .getData(
        `v2/AttendanceData/employee/${employeeId}?year=${this.selectedYear}&month=${this.selectedMonth}`
      )
      .subscribe({
        next: (response: any) => {
          this.getAttendanceCriteria();
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
          this.initChart();
          // this.attendanceData.next(response.data);
        },
        error: (err: any) => {
          this.dataLoader = false;
          this.attendanceData.next([]);
          this.statusCounts$.next([]);
          this.shiftDetails = {};
        },
        complete: () => {
          this.dataLoader = false;
        },
      });
  }

  getStatusClass(color: any) {
    return color;
  }

  // Chart Function
  initChart() {
    const summaryData = this.statusCounts$.value || [];
    const data = summaryData.map((item: any) => item.value);
    const backgroundColors = summaryData.map((item: any) => item.colour);
    this.attendanceSummaryData = {
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 0,
        },
      ],
    };
    this.attendanceSummaryOptions = {
      cutout: '70%',
    };
  }

  // function to get the data of employees by hierarchy
  getAllEmployeeDetails() {
    const statuses = ['Active', 'Trainee Active', 'Active Contract', 'Inactive', 'Trainee Inactive', 'Inactive Contract'];
    this.subscription = this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.getAllEmployeeInfo = response
              .filter(
                (employee: any) =>
                  employee.employeeId !== this.empdata.employeeId
              )
              .map((employee: any) => ({
                ...employee,
                fullName: `${
                  employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName ?? ''} ${
                  employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName ?? ''}`.trim(),
              }))
              .sort((a: any, b: any) =>
                (a.firstName ?? '').localeCompare(b.firstName ?? '')
              ); //  Sort by first name
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

onclickRegularization(date: Date | string) {
  const displayDateString =
    typeof date === 'string'
      ? date.split('T')[0]
      : date.toISOString().split('T')[0];

  const selectedDateObj = new Date(displayDateString);

  if (isNaN(selectedDateObj.getTime())) {
    console.error('Invalid date received:', date);
    return;
  }

  const attendanceRecord = this.attendanceData.value.find((item: any) => {
    const itemDate = new Date(item.date);
    return itemDate.toDateString() === selectedDateObj.toDateString();
  });

  // This is the key fix: use patchValue with emitEvent: false
  this.regularizationForm.patchValue({
    permissionDate: displayDateString
  }, { emitEvent: false });

  this.selectedDateTotalDuration =
    attendanceRecord?.duration?.totalDuration || '00:00:00';
}

  getEmployeeDetails() {
    const EmployeeId = this.empdata.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          if (response) {
            const myTeam = response.filter((e: any) => e.isAccess);
            this.get_Employeelist_forTM = myTeam
              .map((employee: any) => {
                return {
                  ...employee,
                  fullName: `${
                    employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                  }${employee.firstName}
                ${employee.middleName ? employee.middleName + ' ' : ''}${
                    employee.lastName
                  }`,
                };
              })
              .sort((a: any, b: any) => {
                const idA = parseInt(
                  a.fusionEmpId?.replace(/\D/g, '') || '0',
                  10
                );
                const idB = parseInt(
                  b.fusionEmpId?.replace(/\D/g, '') || '0',
                  10
                );
                return idA - idB;
              });
          }
        },
      });
  }

  initliazeExtraHoursForm() {
    this.extraHoursForm = this.fb.group({
      date: [null, Validators.required],
      duration: [null, [Validators.required]],
      description: [null, [Validators.required]],
    });
  }

  extraHoursDuration: { name: string; value: number }[] = [];
  activeForm: string = '';
  extraHrsLoader = false;
  allowedPastDays = 0;
  allowedHours = 0;
  getdatabyentriy() {
    const entity = 'ExtraLogHours';
    const attributes = ['AllowedPastDays', 'AllowedHours'];
    this.http
      .getDatabyentriyvalue(`entityAttributeValues/getv1`, entity, attributes)
      .subscribe({
        next: (data: any) => {
          const allowedPastDaysObj = data.find(
            (d: any) => d.attribute === 'AllowedPastDays'
          );
          const allowedHoursObj = data.find(
            (d: any) => d.attribute === 'AllowedHours'
          );

          this.allowedPastDays = allowedPastDaysObj
            ? Number(allowedPastDaysObj.value)
            : 0;
          this.allowedHours = allowedHoursObj
            ? Number(allowedHoursObj.value)
            : 0;

          if (this.allowedHours > 0) {
            this.generateDurationOptions(this.allowedHours);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
      });
  }

  generateDurationOptions(maxHours: number) {
    this.extraHoursDuration = [];
    for (let i = 0.5; i <= maxHours; i += 0.5) {
      this.extraHoursDuration.push({ name: `${i}`, value: i });
    }
  }

  // Restrict calendar between allowedPastDays and today
  getMinAllowedDate(): string {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - this.allowedPastDays);
    return minDate.toISOString().split('T')[0];
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onExtraHrsSubmit(form: FormGroup) {
    if (form.valid) {
      const formData = form.value;
      const payLoad = {
        raisedFor: this.empdata.employeeId,
        requestedBy: this.empdata.employeeId,
        requestedDate: formData.date,
        createdDate: moment().format('YYYY-MM-DD'),
        status: 'Waiting for Approval',
        duration: formData.duration.value.toString(),
        notes: formData.description,
        moduleId: environment.extraHoursModuleId,
      };
      this.extraHrsLoader = true;
      this.http
        .postData('RegularizationRequests/create', payLoad, {
          responseType: 'text',
        })
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(
              'Extra hours requested successfully'
            );
            this.extraHoursForm.reset();
          },
          error: (err: any) => {
            this.extraHrsLoader = false;
            console.error('Error:', err);

            let errorMessage =
              'An unexpected error occurred. Please try again.';

            try {
              if (typeof err.error === 'string') {
                // Sometimes backend sends a raw string message or JSON string
                const parsed = JSON.parse(err.error);
                errorMessage = parsed.message || err.error;
              } else if (err.error?.message) {
                // Standard object format: { message: '...' }
                errorMessage = err.error.message;
              } else if (err.message) {
                // Fallback for HttpErrorResponse.message
                errorMessage = err.message;
              }
            } catch (e) {
              errorMessage =
                typeof err.error === 'string' ? err.error : errorMessage;
            }

            this.conformationPopup.openErrorModal(errorMessage);
          },
          complete: () => {
            this.extraHrsLoader = false;
            this.extraHoursForm.reset();
          },
        });
    }
  }

  setActiveForm(formName: string) {
    this.activeForm = formName;
  }

  closeModal() {
    this.modalService.dismissAll();
    if (this.activeForm === 'regularization') {
      this.regularizationForm.reset();
    } else if (this.activeForm === 'extraHours') {
      this.extraHoursForm.reset();
    }
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
