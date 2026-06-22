import { Component, OnDestroy, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from '../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule, NgbModal, NgbOffcanvas, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { AccordionModule } from 'primeng/accordion';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subject, Subscription, takeUntil, forkJoin } from 'rxjs';
import { IResourceDetail, TimesheetResponse } from '../../../timesheetmodel';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { Router } from '@angular/router';
import { EncriptdecriptService } from '../../../services/encriptdecript.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { environment } from '../../../../environments/environment';
import { WeekMatrix, RowModel, DayModel, transformV2ResponseToWeekMatrix, isCellLocked, recalculateTotals, ApprovalStatus } from './timesheet-matrix.model';
import { DayValidationService, ValidationContext } from './day-validation.service';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { BulkUploadStore } from '../bulk-upload/models/bulk-upload.store';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-time-sheet-view',
  imports: [ProjectManagementModuleInfoComponent, NgbDatepickerModule, FormsModule, ReactiveFormsModule,
    NgbPopover, CommonModule, DatePicker, DateformatPipe, AccordionModule, InfoIconComponent, ConfirmationIconComponent,
    TranslateModule, DataLoaderContentComponent, TimesheetsTabsComponent, MenuModule, MultiSelectModule, Select],
  templateUrl: './time-sheet-view.component.html',
  styleUrl: './time-sheet-view.component.scss',

})

export class TimeSheetViewComponent implements OnInit, OnDestroy {
  timesheetForm!: FormGroup;
  orgholidays: any;
  orgweekend: any;
  lpdata = [] as Ilpid[];
  loading = false;
  dayForm!: FormGroup;
  jobdetails: any;
  weekStartDate: Date | null = null;
  weekEndDate: Date | null = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  weekDates: Date[] = [];
  employeeId: any;
  subscription!: Subscription;
  showDots: { [rowIndex: number]: { [day: string]: boolean } } = {};
  date!: Date[];
  selectedentryid: any;
  displayLabel = 'Please Select Date';
  formattedweakendStart: any;
  rowdelete: any;
  private start!: Date;
  private end!: Date;
  effectiveDate: any;
  weakstartdate!: Date;
  weakenddate!: Date;
  maxMonth: Date = moment().add(1, 'months').endOf('month').toDate();
  selectedclientid: any;
  selectedprojectid: any;
  selectedPhaseId: any;
  selectedProjectName: any;
  selectedClientname: any;
  selectedPhaseName: any;
  resourceId: any;
  selectedShiftDetails: any;
  clients: any[] = [];
  noclientproject = false;
  availableProjects: any[] = [];
  activeEmplist = [] as any;
  selectedProjectResource: any;
  timesheetdata!: TimesheetResponse;
  resourcesList: IResourceDetail[] = [];
  resourcesArrayList: any[] = [];
  totalDuration: any;
  spinnerLoader = false;
  empdata = {} as any;
  employeeSelected = false;
  loggedinuser = {} as any;
  spinnerLoaderforallrecoders = false;
  datesSelected = false;
  selectedResource: IResourceDetail | null = null;
  errorOccurred = false;
  errormodaldata: any;
  lockMessages: any;
  totalCount: any;
  weekMatrix!: WeekMatrix;
  holidaysData: any[] = [];
  weekendsData: any[] = [];
  leavesData: any[] = [];
  currentRowIndex: number = -1;
  currentDay: string = '';

  @ViewChild('datePicker') datePicker: any;
  @ViewChild('deleteconformation', { static: true }) deleteconformation!: TemplateRef<any>;
  @ViewChild('employeeDropdown') employeeDropdown: any;
  @ViewChild('errormodal') errormodal!: TemplateRef<any>;
  @ViewChild('addtask') addtask!: TemplateRef<any>;
  @ViewChild('cloneTimesheetModal') cloneTimesheetModal!: TemplateRef<any>;
  cloneForm!: FormGroup;
  cloneSourceWeekLabel = '';
  cloneTargetWeekLabel = '';
  cloneErrorMessage: string | null = null;
  private readonly baseMenuItems = [
    { key: 'import', label: 'Import', icon: 'file-import-icon', command: () => this.navigateToImport() },
    { key: 'export', label: 'Export', icon: 'file-export-icon', command: () => this.navigateToExport() },
    { key: 'viewHistoryLog', label: 'View History Log', icon: 'bi bi-clock-history me-2', command: () => this.navigateToHistoryLog() },
  ];
  bulkOperationMenuItems: MenuItem[] = [];
  canBulkImport = false;
  canBulkExport = false;
  canViewHistoryLog = false;
  taskType: any;
  alltaskTypes = [] as any;
  responseSummary = {
    failedreason: '',
    successRecordsCount: 0,
    failureRecordsCount: 0,
    totalRecordsCount: 0
  };
   @ViewChild('releaseSummary') releaseSummaryModal!: any;
  constructor(private fb: FormBuilder, private modalService: NgbModal,private offcanvasService: NgbOffcanvas,
    private http: HttpService, public formValidation: FormValidationsService,
    public dayValidationService: DayValidationService, public authService: AuthService,
    public rbac: RbacService, private conformationPopup: OpenModalService,
    private router: Router, private encryptionService: EncriptdecriptService, private bulkStore: BulkUploadStore) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = this.empdata?.employeeId;
    const startOfWeek = moment().startOf('isoWeek'); // Sunday by default (you can use .startOf('isoWeek') for Monday)
    const endOfWeek = moment().endOf('isoWeek');
    this.setWeekRange(startOfWeek, endOfWeek);
    this.timesheetForm = this.fb.group({ projects: this.fb.array([]) });
    this.getResourceDetailsByManagerId();
    this.getResourceData();
    this.getTimesheetLocks();
    this.getJobDetails()
    this.getholidaybyempid();
    this.getweekendbyempid();
    this.getleveasdata();
    // this.getTeamManagersDetails();
    // this.getAllEmployeeDetails();
    this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
    this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
    this.buildBulkOperationMenuItems();
    this.getTaskType();
  }
  getTaskType() {
    this.loading = true;
    this.subscription = this.http.getData('TaskType').subscribe({
      next: (res: any) => {
        this.loading = false;
        this.alltaskTypes = res;
        this.taskType = res?.filter((ele: any) => ele?.status?.toLowerCase() === 'active');
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false)
    });
  }
  get projects(): FormArray {
    return this.timesheetForm.get('projects') as FormArray<FormGroup>;
  }

  secondsToHHMM(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  navigateToImport() {
    localStorage.setItem('timesheetImportStep', '1');
    //clear the batch id from the local storage
    localStorage.removeItem('bulkImportBatchId');
    this.bulkStore.reset();
    this.router.navigate(['/project-management/timesheet/bulk-upload']);
  }
  navigateToExport() {
    localStorage.setItem('timesheetExportStep', '1');
    localStorage.removeItem('timesheetExportFilters');
    this.router.navigate(['/project-management/timesheet/bulk-export']);
  }
  navigateToHistoryLog() {
    if (this.rbac.allowedToAccess('View History Import Tab.view')) {
      this.router.navigate(['/project-management/timesheet/historylog']);
    } else if (this.rbac.allowedToAccess('View History Export Tab.view')) {
      this.router.navigate(['/project-management/timesheet/export-history']);
    } else {
      this.router.navigate(['/unauthorized']);
    }

  }
  private buildBulkOperationMenuItems(): void {
    this.canBulkImport = this.rbac.allowedToAccess('Timesheet Bulk Import.view');
    this.canBulkExport = this.rbac.allowedToAccess('Timesheet Bulk Export.view');
    this.canViewHistoryLog = this.rbac.allowedToAccess('View History Import Tab.view') || this.rbac.allowedToAccess('View History Export Tab.view');

    const items = this.baseMenuItems.filter((item: any) => {
      if (item.key === 'import') {
        return this.canBulkImport;
      }
      if (item.key === 'export') {
        return this.canBulkExport;
      }
      if (item.key === 'viewHistoryLog') {
        return this.canViewHistoryLog;
      }
      return true;
    });
    this.bulkOperationMenuItems = items;
  }

  TimesheetLockData: any;
  getTimesheetLocks() {
    const categoryIds = '30';
    const params: any = {};
    if (categoryIds) {
      params.categoryId = categoryIds;
    }
    const queryString = `?categoryIds=${encodeURIComponent(params.categoryId)}`;
    this.http.getpagentiontData(`AttendanceLockConfigurations/getall${queryString}`, '').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.TimesheetLockData = response.items;
          this.checkTimesheetLock(this.TimesheetLockData);
        },
        error: (err: any) => {
        },
        complete: () => {
        }
      });
  }
  lockMessage: string | null = null;
  lockextendMessage: string | null = null;

  checkTimesheetLock(apiResponse: any, selectedStart?: Date, selectedEnd?: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Default to the component's current week if not provided; otherwise fall back to current month range
    if (!selectedStart || !selectedEnd) {
      if (this.start && this.end) {
        selectedStart = new Date(this.start);
        selectedEnd = new Date(this.end);
      } else {
        selectedStart = new Date(today.getFullYear(), today.getMonth(), 1);
        selectedEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
    }

    // Normalize incoming dates
    selectedStart.setHours(0, 0, 0, 0);
    selectedEnd.setHours(0, 0, 0, 0);

    this.lockMessages = [];

    if (!apiResponse || apiResponse.length === 0) return;

    // Filter only records where end >= selectedStart (period not fully past)
    const relevantRecords = apiResponse.filter((item: any) => {
      const end = new Date(item.endDate);
      end.setHours(0, 0, 0, 0);
      return end >= selectedStart!;
    });

    // Sort by start date
    relevantRecords.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    relevantRecords.forEach((item: any) => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const effective = new Date(item.effectiveDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      effective.setHours(0, 0, 0, 0);

      // Only show if overlaps selected week
      if (selectedEnd! < start || selectedStart! > end) return;

      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const effStr = effective.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      if (effective > today) {
        // Future effective date
        this.lockMessages.push({
          type: 'upcoming',
          text: `Timesheet for the period <b>(${startStr} – ${endStr})</b> will be locked on <b>${effStr}</b>. Please ensure timesheet entries are submitted before <b>${effStr}</b>.`
        });
      } else if (effective < today) {
        // Past effective date
        this.lockMessages.push({
          type: 'locked',
          text: `Timesheet submission is locked for <b>(${startStr} – ${endStr})</b>. Please contact HR/Admin for assistance.`
        });
      } else if (effective.getTime() === today.getTime()) {
        // Effective today
        this.lockMessages.push({
          type: 'locked-today',
          text: `Timesheet submission is locked for <b>(${startStr} – ${endStr})</b>. Please contact HR/Admin for assistance.`
        });
      }
    });

    console.log(this.lockMessages);
  }
  checkTimesheetLockByMonth(selectedStart: Date, selectedEnd: Date) {
    const lockedItems = this.TimesheetLockData || [];
    this.lockMessages = []; //  reset array each time
    const today = new Date();

    // Sort locks for consistent order
    const sortedLocks = lockedItems.sort(
      (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    sortedLocks.forEach((item: any) => {
      const lockStart = new Date(item.startDate);
      const lockEnd = new Date(item.endDate);
      const effective = new Date(item.effectiveDate);

      // check overlap between selected date range and locked range
      const overlaps =
        (selectedStart <= lockEnd && selectedEnd >= lockStart) ||
        (selectedStart >= lockStart && selectedStart <= lockEnd);

      if (overlaps) {
        const startStr = lockStart.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });
        const endStr = lockEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });
        const effStr = effective.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });

        if (effective >= today) {
          //  Future or current effective date
          this.lockMessages.push({
            type: 'upcoming',
            text: `Timesheet for the period <b>(${startStr} – ${endStr})</b> will be locked on <b>${effStr}</b>.
                 Please ensure timesheet entries are submitted before <b>${effStr}</b>.`
          });
        } else {
          // Past effective date (already locked)
          this.lockMessages.push({
            type: 'locked',
            text: `Timesheet submission is locked for <b>(${startStr} – ${endStr})</b>.
                 Please contact HR/Admin for assistance.`
          });
        }
      }
    });

    // Optional: If you still want combined HTML message string for modal usage
    this.errormodaldata = this.lockMessages.length > 0 ? this.lockMessages.map((m: { text: any; }) => m.text).join('<br><br>') : '';
  }
  createDayEntry(day?: any, entryDate?: any, isProjectSelected: boolean = false): FormGroup {
    const isNotEntered = day?.approvalStatus === 'Not Entered';
    const dateValue = day?.entryDate || entryDate;
    const entryDateObj = dateValue ? new Date(dateValue) : null;
    // Use existing day data or determine from date
    let blockReason = day?.blockReason || '';
    let isBlocked = day?.isBlocked || false;
    let isLeave = day?.isLeave || false;
    // If no existing data, determine from date
    if (!day && entryDateObj) {
      const dayStatus = this.getDayStatus(entryDateObj);
      blockReason = dayStatus.blockReason;
      isBlocked = dayStatus.isBlocked;
      isLeave = dayStatus.isLeave;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize today’s date
    const isFutureDate = entryDateObj ? entryDateObj > today : false;
    const isWeekend = blockReason === 'Weekend';
    const projectId = day?.projectId;
    const approvedStatus = day?.approvalStatus === 'Processed' || day?.approvalStatus === 'Waiting for Approval';
    const matchedResource = this.resourcesArrayList?.find(
      (r: any) => r?.project?.projectId === projectId &&
        r.client?.clientId === day?.clientId &&
        r?.phase?.phaseId === (day?.phaseId ? day.phaseId : null
        ));
    console.log(matchedResource);

    const resourcestartdate = matchedResource?.startDate ? new Date(matchedResource.startDate) : null;
    const resourceenddate = matchedResource?.endDate ? new Date(matchedResource.endDate) : null;
    // const resourceenddate = matchedResource?.endDate
    //   ? new Date(matchedResource.endDate)
    //   : null;
    if (resourcestartdate) {
      resourcestartdate.setHours(0, 0, 0, 0);
    }
    if (resourceenddate) {
      resourceenddate.setHours(0, 0, 0, 0);
    }
    if (entryDateObj) {
      entryDateObj.setHours(0, 0, 0, 0);
    }
    let isEffective = false;
    if (matchedResource && !matchedResource?.isNoClientProject) {
      // Check resource date range
      const resourceDateValid = resourcestartdate && entryDateObj
        ? entryDateObj.getTime() >= resourcestartdate.getTime() : true;

      const resourceEndValid = resourceenddate && entryDateObj
        ? entryDateObj.getTime() <= resourceenddate.getTime() : true;
      // Check phase date range if phase exists
      let phaseDateValid = true;
      if (matchedResource.phase && entryDateObj) {
        const phaseStartDate = matchedResource.phase.startDate ? new Date(matchedResource.phase.startDate) : null;
        const phaseEndDate = matchedResource.phase.endDate ? new Date(matchedResource.phase.endDate) : null;
        if (phaseStartDate) {
          phaseStartDate.setHours(0, 0, 0, 0);
          phaseDateValid = phaseDateValid && entryDateObj.getTime() >= phaseStartDate.getTime();
        }
        if (phaseEndDate) {
          phaseEndDate.setHours(0, 0, 0, 0);
          phaseDateValid = phaseDateValid && entryDateObj.getTime() <= phaseEndDate.getTime();
        }
      }
      isEffective = resourceDateValid && resourceEndValid && phaseDateValid;
    } else {
      // No-client/no-project → always effective
      isEffective = true;
    }
    const isWeekendAllowedProject = matchedResource?.weekendWorkAllowed;
    //enable/disable
    const shouldEnable = isProjectSelected && !isLeave && !isFutureDate && isEffective && !approvedStatus &&
      (this.employeeId === this.empdata?.employeeId) ? isBlocked ? isWeekend && isWeekendAllowedProject : true : false;
    // Duration control setup
    const billablecheck = !!(matchedResource?.billable || this.selectedProjectResource?.billable);

    const durationControl = this.fb.control(isNotEntered ? '' : day?.durationSeconds != null ?
      this.secondsToHHMM(day.durationSeconds) : '',
      Validators.required
    );
    // Disable duration if not editable
    if (!shouldEnable) {
      durationControl.disable({ emitEvent: false });
    }
    // Return full FormGroup
    return this.fb.group({
      entryId: [{ value: day?.entryId || null, disabled: !shouldEnable }],
      approverId: [{ value: day?.approverId || null, disabled: !shouldEnable }],
      clientName: [{ value: day?.clientName || '', disabled: !shouldEnable }],
      clientId: [{ value: day?.clientId || null, disabled: !shouldEnable }],
      projectId: [{ value: day?.projectId || null, disabled: !shouldEnable }],
      projectName: [{ value: day?.projectName || '', disabled: !shouldEnable }],
      phaseId: [{ value: day?.phaseId || null, disabled: !shouldEnable }],
      phaseName: [{ value: day?.phaseName || '', disabled: !shouldEnable }],
      entryDate: [{ value: dateValue || '', disabled: !shouldEnable }],
      startTime: [{ value: isNotEntered ? '' : day?.startTime || '', disabled: !shouldEnable }],
      endTime: [{ value: isNotEntered ? '' : day?.endTime || '', disabled: !shouldEnable }],
      duration: durationControl,
      description: [{ value: isNotEntered ? null : day?.description || null, disabled: !shouldEnable }, [Validators.required]],
      approvalStatus: [{ value: day?.approvalStatus || null, disabled: !shouldEnable }],
      isBillable: [{ value: day?.isBillable || false, disabled: !billablecheck }],
      isLeave: [{ value: day?.isLeave || false, disabled: true }],
      isBlocked: [{ value: day?.isBlocked || false, disabled: true }],
      rejectReason: [day?.rejectReason || ''],
      blockReason: [blockReason],
      resourceId: [{ value: day?.resourceId || null }],
      taskId: [{ value: day?.taskId || null, disabled: !shouldEnable }],
      pendingApprovalDetails: [day?.pendingApprovalDetails || null],
      taskName: [day?.taskName || null],

    });
  }

  onDateSelect(selectedDate: Date) {
    if (!selectedDate) return;
    const selected = moment(selectedDate);
    const monday = selected.clone().startOf('isoWeek');  // Monday
    const sunday = selected.clone().endOf('isoWeek');    // Sunday
    this.start = monday.toDate();
    this.end = sunday.toDate();
    //  Update min/max for datepicker to highlight current week
    this.weakstartdate = this.start;
    this.weakenddate = this.end;
    // Assign the date range to the picker model
    this.date = [this.start, this.end];
    // Update the week range visually / in state
    this.setWeekRange(monday, sunday);
    this.checkTimesheetLockByMonth(monday.toDate(), sunday.toDate()); // 🔹 check locks by mont
    // Format start date for API call
    const formattedStart = monday.format('YYYY-MM-DD');
    this.loadTimeSheetByResource(formattedStart);
    // Close the datepicker
    setTimeout(() => {
      if (this.datePicker) {
        this.datePicker.hideOverlay();
      }
    }, 100);
  }

  private loadTimeSheetByResource(formattedStart: string): void {
    if (this.employeeSelected && this.selectedResource) {
      let employeeIdToSend = this.empdata?.employeeId; // default logged-in user ID
      let targetEmployeeId: number | undefined = undefined;
      let isReportee: boolean | undefined = undefined;
      switch (this.selectedResource.key) {
        case 'team':
          // Logged-in user is the employee; selected is the reportee
          employeeIdToSend = this.empdata?.employeeId;
          targetEmployeeId = this.selectedResource.id;
          isReportee = this.selectedResource.isReportee;
          break;
        case 'all employees':
          // Selected employee is the one whose timesheet we fetch
          employeeIdToSend = this.selectedResource.id;
          targetEmployeeId = this.selectedResource.id;
          isReportee = this.selectedResource.isReportee;
          break;
        default:
          break;
      }
      this.getTimeSheetEntriesbyEmployeeId(
        employeeIdToSend,
        formattedStart,
      );
    } else {
      // Fallback: load logged-in user’s data
      this.getTimeSheetEntriesbyEmployeeId(this.employeeId, formattedStart);
    }
  }

  openCloneModal() {
    this.cloneErrorMessage = null;
    this.initializeCloneForm();
    this.offcanvasService.open(this.cloneTimesheetModal, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
      panelClass: 'clone-offcanvas-panel'
    });
  }

  private initializeCloneForm(): void {
    const defaultSourceStart = this.start ? moment(this.start).subtract(7, 'days').startOf('isoWeek').toDate() : moment().startOf('isoWeek').toDate();
    const defaultSourceEnd = this.start ? moment(this.start).subtract(7, 'days').endOf('isoWeek').toDate() : moment().endOf('isoWeek').toDate();
    const defaultTargetStart = this.start ? this.start : moment().startOf('isoWeek').toDate();
    const defaultTargetEnd = this.start ? this.end : moment().endOf('isoWeek').toDate();

    this.cloneForm = this.fb.group({
      sourceWeekDateRange: [null, Validators.required],
      targetWeekDateRange: [null, Validators.required],
      cloneMode: ['merge', Validators.required],
      copyProjects: [{ value: true, disabled: true }],
      copyLoggedHours: [{ value: true, disabled: true }],
      copyDescription: [false],
      copyTask: [false]
    });

    this.cloneForm.get('sourceWeekDateRange')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((range: Date[] | null) => this.updateCloneSourceWeekLabel(range));

    this.cloneForm.get('targetWeekDateRange')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((range: Date[] | null) => this.updateCloneTargetWeekLabel(range));

    this.cloneSourceWeekLabel = '';
    this.cloneTargetWeekLabel = '';
  }

  onCloneSourceDateSelect(selectedDate: Date | Date[]) {
    if (!selectedDate) return;
    const chosenRange = Array.isArray(selectedDate) ? selectedDate : [selectedDate];
    this.cloneForm.patchValue({ sourceWeekDateRange: chosenRange });
  }

  onCloneTargetDateSelect(selectedDate: Date | Date[]) {
    if (!selectedDate) return;
    const chosenRange = Array.isArray(selectedDate) ? selectedDate : [selectedDate];
    this.cloneForm.patchValue({ targetWeekDateRange: chosenRange });
  }

  private getRangeStartDate(range: Date[] | null): Date | null {
    if (!Array.isArray(range) || range.length === 0 || !range[0]) {
      return null;
    }
    return range[0] instanceof Date ? range[0] : new Date(range[0]);
  }

  private updateCloneSourceWeekLabel(range: Date[] | null): void {
    const date = this.getRangeStartDate(range);
    if (!date) {
      this.cloneSourceWeekLabel = '';
      return;
    }
    const start = moment(date).startOf('isoWeek');
    const end = moment(date).endOf('isoWeek');
    this.cloneSourceWeekLabel = `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
  }

  private updateCloneTargetWeekLabel(range: Date[] | null): void {
    const date = this.getRangeStartDate(range);
    if (!date) {
      this.cloneTargetWeekLabel = '';
      return;
    }
    const start = moment(date).startOf('isoWeek');
    const end = moment(date).endOf('isoWeek');
    this.cloneTargetWeekLabel = `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
  }

  private getWeekRangeFromDate(date: Date): { start: Date; end: Date } {
    const selected = moment(date);
    return {
      start: selected.clone().startOf('isoWeek').toDate(),
      end: selected.clone().endOf('isoWeek').toDate()
    };
  }

  private getWeekDatesFromDate(date: Date): Date[] {
    const { start } = this.getWeekRangeFromDate(date);
    return Array.from({ length: 7 }, (_, index) => moment(start).add(index, 'days').toDate());
  }

  private isCurrentWeekLocked(): boolean {
    return this.lockMessages?.some((item: any) => item.type === 'locked' || item.type === 'locked-today') ?? false;
  }

  private findMatchingProjectRowIndex(sourceRow: RowModel): number {
    return this.projects.controls.findIndex((project) => {
      const isNoClientProject = project.get('isNoClientProject')?.value;
      const projectId = project.get('projectId')?.value;
      const clientId = project.get('clientId')?.value;
      const phaseId = project.get('phaseId')?.value ?? null;
      return (
        isNoClientProject === sourceRow.isNoClientProject &&
        projectId === sourceRow.projectId &&
        clientId === sourceRow.clientId &&
        phaseId === (sourceRow.phaseId ?? null)
      );
    });
  }

  private shouldSkipCloneForTargetCell(targetCell: any | undefined, cloneMode: string): boolean {
    if (!targetCell) {
      return false;
    }

    const targetApproval = targetCell.approvalStatus;
    const targetDuration = targetCell.durationSeconds;
    const hasTargetValue = !!targetDuration || targetApproval !== ApprovalStatus.NotEntered;

    if (cloneMode === 'merge') {
      return false;
    }

    if (cloneMode === 'overwrite') {
      const status = targetApproval?.toLowerCase();

      return status !== 'draft' && status !== 'rejected';
    }


    return true;
  }

  private buildClonePayloads(sourceMatrix: WeekMatrix, targetMatrix: WeekMatrix, cloneMode: string, targetWeekDates: Date[], targetTimesheetId: number, sourceWeekRange: Date[]): any[] {
    const payloads: any[] = [];
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const copyProjects = this.cloneForm.get('copyProjects')?.value ?? true;
    const copyLoggedHours = this.cloneForm.get('copyLoggedHours')?.value ?? false;
    const copyDescription = this.cloneForm.get('copyDescription')?.value ?? false;
    const copyTask = this.cloneForm.get('copyTask')?.value ?? false;

    const groupUsage = new Map<string, number>();

    sourceMatrix.rows.forEach((sourceRow) => {
      const groupKey = `${sourceRow.projectId}_${sourceRow.phaseId}_${sourceRow.clientId}_${sourceRow.isNoClientProject}`;
      const matchingTargetRows = targetMatrix.rows.filter((targetRow) =>
        targetRow.projectId === sourceRow.projectId &&
        targetRow.phaseId === sourceRow.phaseId &&
        targetRow.clientId === sourceRow.clientId &&
        targetRow.isNoClientProject === sourceRow.isNoClientProject
      );

      const usageCount = groupUsage.get(groupKey) ?? 0;
      let targetRow: RowModel | null = null;

      if (usageCount < matchingTargetRows.length) {
        targetRow = matchingTargetRows[usageCount];
        groupUsage.set(groupKey, usageCount + 1);
      } else if (matchingTargetRows.length > 0) {
        targetRow = matchingTargetRows[matchingTargetRows.length - 1];
        groupUsage.set(groupKey, usageCount + 1);
      } else if (copyProjects) {
        targetRow = sourceRow;
        groupUsage.set(groupKey, usageCount + 1);
      }

      if (!targetRow) {
        return;
      }


      const selectedSourceDays = sourceMatrix.days.filter(day => {
        const currentDate = moment(day.date);

        return currentDate.isBetween(
          moment(sourceWeekRange[0]),
          moment(sourceWeekRange[1]),
          'day',
          '[]'
        );
      });
      selectedSourceDays.forEach((sourceDay, index) => {
        const sourceCell = sourceMatrix.cellMap.get(`${sourceRow.rowId}_${sourceDay.date}`);
        if (!sourceCell) {
          return;
        }

        const shouldCloneSourceCell =
          copyLoggedHours ? !!sourceCell.durationSeconds :
            copyDescription ? !!sourceCell.description :
              copyTask ? !!sourceCell.taskId :
                (copyProjects ? true : false);

        if (sourceCell.approvalStatus?.toLowerCase() === 'rejected') {
          return;
        }

        if (!shouldCloneSourceCell) {
          return;
        }

        const targetDate = targetWeekDates[index];

        if (!targetDate) {
          return;
        }
        const targetCell = targetMatrix.cellMap.get(`${targetRow.rowId}_${targetDate}`);

        console.log('Source Day:', sourceDay.date);
        console.log('Target Day:', targetDate);
        console.log('Target Cell:', targetCell);
        console.log('Clone Mode:', cloneMode);
        console.log(
          'Skip Result:',
          this.shouldSkipCloneForTargetCell(targetCell, cloneMode)
        );

        if (this.shouldSkipCloneForTargetCell(targetCell, cloneMode)) {
          return;
        }

        const entryDate = moment(targetWeekDates[index]).format('YYYY-MM-DD');
        const payload: any = {
          entryId: targetCell?.entryId || 0,
          employeeId: this.employeeId || 0,
          entryDate,
          approvalStatus: 'draft',
          clientId: targetRow.clientId || null,
          projectId: targetRow.projectId || null,
          phaseId: targetRow.phaseId || null,
          timesheetId: targetTimesheetId || 0,
          isOverride: false,
          totalDurationSeconds: copyLoggedHours ? sourceCell.durationSeconds || 0 : 0,
          description: copyDescription ? sourceCell.description || '' : '',
          isBillable: sourceCell.isBillable || false,
          moduleId: 30,
          resourceId: targetRow.resourceId || sourceRow.resourceId || null,
          startTime: copyLoggedHours ? this.toTimeSpan(sourceCell.startTime) : null,
          endTime: copyLoggedHours ? this.toTimeSpan(sourceCell.endTime) : null,
          taskId: copyTask ? sourceCell.taskId || null : null
        };

        payloads.push(payload);
      });
    });

    return payloads;
  }

  cloneTimesheetEntries(): void {
    if (!this.cloneForm || this.cloneForm.invalid) {
      this.cloneErrorMessage = 'Please select a source week and clone method.';
      return;
    }

    if (this.isCurrentWeekLocked()) {
      this.cloneErrorMessage = 'Current week is locked and cannot be cloned into.';
      return;
    }

    this.cloneErrorMessage = null;
    this.spinnerLoader = true;

    const sourceWeekRange = this.cloneForm.get('sourceWeekDateRange')?.value as Date[] | null;
    const targetWeekRange = this.cloneForm.get('targetWeekDateRange')?.value as Date[] | null;

    if (!sourceWeekRange || !targetWeekRange) {
      this.cloneErrorMessage = 'Please select both source and target week ranges.';
      this.spinnerLoader = false;
      return;
    }

    const sourceWeekStartDate = this.getRangeStartDate(sourceWeekRange) || new Date();
    const sourceWeekStart = moment(sourceWeekStartDate).startOf('isoWeek').format('YYYY-MM-DD');
    const targetWeekStartDate = this.getRangeStartDate(targetWeekRange) || new Date();
    const targetWeekStart = moment(targetWeekStartDate).startOf('isoWeek').format('YYYY-MM-DD');

    console.log('Source Week Range:', sourceWeekRange);
    console.log('Target Week Range:', targetWeekRange);
    console.log('Source Week Start:', sourceWeekStart);
    console.log('Target Week Start:', targetWeekStart);

    const sourceStart = moment(sourceWeekRange[0]).format('YYYY-MM-DD');
    const sourceEnd = moment(sourceWeekRange[1]).format('YYYY-MM-DD');
    const targetStart = moment(targetWeekRange[0]).format('YYYY-MM-DD');
    const targetEnd = moment(targetWeekRange[1]).format('YYYY-MM-DD');

    if (sourceStart === targetStart && sourceEnd === targetEnd) {
      this.cloneErrorMessage = 'Source week and target week cannot be the same.';
      this.spinnerLoader = false;
      return;
    }

    const sourceDays =
      moment(sourceWeekRange[1]).diff(moment(sourceWeekRange[0]), 'days') + 1;

    const targetDays =
      moment(targetWeekRange[1]).diff(moment(targetWeekRange[0]), 'days') + 1;

    if (sourceDays !== targetDays) {
      this.cloneErrorMessage =
        'Source week and target week must contain the same number of days.';
      this.spinnerLoader = false;
      return;
    }

    const targetWeekDates: Date[] = [];

    for (
      let d = moment(targetWeekRange[0]);
      d.isSameOrBefore(targetWeekRange[1], 'day');
      d.add(1, 'day')
    ) {
      targetWeekDates.push(d.toDate());
    }

    console.log('Target Week Dates', targetWeekDates);


    const cloneMode = this.cloneForm.get('cloneMode')?.value;
    const copyProjects = this.cloneForm.get('copyProjects')?.value ?? true;
    const copyLoggedHours = this.cloneForm.get('copyLoggedHours')?.value ?? false;
    const copyDescription = this.cloneForm.get('copyDescription')?.value ?? false;
    const copyTask = this.cloneForm.get('copyTask')?.value ?? false;

    if (!copyProjects && !copyLoggedHours && !copyDescription && !copyTask) {
      this.spinnerLoader = false;
      this.cloneErrorMessage = 'Please select at least one clone option.';
      return;
    }

    forkJoin([
      this.http.getData(`v2/Timesheet/week/employee/${this.employeeId}?weekStartDate=${sourceWeekStart}`),
      this.http.getData(`v2/Timesheet/week/employee/${this.employeeId}?weekStartDate=${targetWeekStart}`)
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([sourceRes, targetRes]: any) => {
          const sourceMatrix = transformV2ResponseToWeekMatrix(sourceRes);
          const targetMatrix = transformV2ResponseToWeekMatrix(targetRes);

          console.log(
            'Source Matrix Days',
            sourceMatrix.days.map((d: any) => d.date)
          );

          console.log(
            'Target Matrix Days',
            targetMatrix.days.map((d: any) => d.date)
          );

          const payloads = this.buildClonePayloads(sourceMatrix, targetMatrix, cloneMode, targetWeekDates, targetMatrix.metadata.timesheetId || 0, sourceWeekRange);

          console.log('Clone Payloads', payloads);
          console.log('Payload Count', payloads.length);

          if (!payloads.length) {
            this.spinnerLoader = false;
            this.conformationPopup.openErrorModal('No entries available to clone from the selected source week.');
            return;
          }

          forkJoin(payloads.map((payload) => this.http.postdata('v2/Timesheet/save-or-update', payload)))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.spinnerLoader = false;
                this.offcanvasService.dismiss();
                this.conformationPopup.openSuccessModal('Timesheet entries cloned successfully.');
                this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
                this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
              },
              error: (err: any) => {
                this.spinnerLoader = false;
                this.cloneErrorMessage =
                  err?.error?.message || 'Failed to clone timesheet entries.';
              }
            });

        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.cloneErrorMessage = err?.error?.message || 'Failed to load source or target week entries.';
        }
      });
  }

  isCloneDisabled(): boolean {
    return this.spinnerLoader || this.isCurrentWeekLocked();
  }
  // --- Add new project row ---
  addProject(project?: any, isProjectSelected: boolean = false) {
    const days = project?.days || [];
    let selectedProject = null;
    if (project?.isNoClientProject) {
      selectedProject = {
        clientId: null,
        clientName: 'No Client',
        projectId: null,
        projectName: 'No Project',
        phaseId: null,
        phaseName: null,
      };
    } else if (project && project.projectId && project.phaseId) {
      selectedProject = {
        clientId: project.clientId,
        clientName: project.clientName ?? '',
        projectId: project.projectId,
        projectName: project.projectName ?? '',
        phaseId: project.phaseId || null,
        phaseName: project.phaseName ?? '',
      };
    }
    const projectForm = this.fb.group({
      rowId: [project?.rowId || null],
      projectId: [project?.projectId || null],
      projectName: [project?.projectName || ''],
      clientId: [project?.clientId || null],
      clientName: [project?.clientName || null],
      phaseId: [project?.phaseId || null],
      phaseName: [project?.phaseName || null],
      selectedProject: [selectedProject],
      isNoClientProject: [!!project?.isNoClientProject],
      searchTerm: [''],
      resourceId: [null],
      selectedProjectResource: [null],
      mon: this.createDayEntry(days[0] || {}, this.weekDates[0], isProjectSelected),
      tue: this.createDayEntry(days[1] || {}, this.weekDates[1], isProjectSelected),
      wed: this.createDayEntry(days[2] || {}, this.weekDates[2], isProjectSelected),
      thu: this.createDayEntry(days[3] || {}, this.weekDates[3], isProjectSelected),
      fri: this.createDayEntry(days[4] || {}, this.weekDates[4], isProjectSelected),
      sat: this.createDayEntry(days[5] || {}, this.weekDates[5], isProjectSelected),
      sun: this.createDayEntry(days[6] || {}, this.weekDates[6], isProjectSelected),
    });
    const newIndex = this.projects.length;
    this.projects.push(projectForm);
    this.showDots[newIndex] = {
      mon: false, tue: false, wed: false, thu: false,
      fri: false, sat: false, sun: false,
    };
  }

  addProjectFromRow(row: RowModel, isProjectSelected: boolean = false) {
    const selectedProject = row.isNoClientProject ? {
      clientId: null,
      clientName: 'No Client',
      projectId: null,
      projectName: 'No Project',
      phaseId: null,
      phaseName: null
    } : {
      clientId: row.clientId,
      clientName: row.clientName,
      projectId: row.projectId,
      projectName: row.projectName,
      phaseId: row.phaseId,
      phaseName: row.phaseName
    };

    const projectForm = this.fb.group({
      rowId: [row.rowId],
      projectId: [row.projectId],
      projectName: [row.projectName],
      clientId: [row.clientId],
      clientName: [row.clientName],
      phaseId: [row.phaseId],
      phaseName: [row.phaseName],
      selectedProject: [selectedProject],
      isNoClientProject: [row.isNoClientProject],
      searchTerm: [''],
      resourceId: [row.resourceId],
      selectedProjectResource: [null],
      mon: this.createDayEntryFromCell(row, this.weekMatrix.days[0], isProjectSelected),
      tue: this.createDayEntryFromCell(row, this.weekMatrix.days[1], isProjectSelected),
      wed: this.createDayEntryFromCell(row, this.weekMatrix.days[2], isProjectSelected),
      thu: this.createDayEntryFromCell(row, this.weekMatrix.days[3], isProjectSelected),
      fri: this.createDayEntryFromCell(row, this.weekMatrix.days[4], isProjectSelected),
      sat: this.createDayEntryFromCell(row, this.weekMatrix.days[5], isProjectSelected),
      sun: this.createDayEntryFromCell(row, this.weekMatrix.days[6], isProjectSelected)
    });

    const newIndex = this.projects.length;
    this.projects.push(projectForm);
    this.showDots[newIndex] = {
      mon: false, tue: false, wed: false, thu: false,
      fri: false, sat: false, sun: false
    };
  }

  private createDayEntryFromCell(row: RowModel, day: DayModel, isProjectSelected: boolean = false): FormGroup {
    const cellKey = `${row.rowId}_${day.date}`;
    const cell = this.weekMatrix.cellMap.get(cellKey);

    if (!cell) {
      return this.createDayEntry({}, day.dateObj, isProjectSelected);
    }

    const matchedResources = this.resourcesArrayList?.filter((r: any) =>
      r?.project?.projectId === row.projectId &&
      r.client?.clientId === row.clientId &&
      r?.phase?.phaseId === row.phaseId
    );

    const mergedResource = matchedResources?.length
      ? {
        ...matchedResources[0],
        startDate: matchedResources.reduce((min, r) =>
          new Date(r.startDate) < new Date(min) ? r.startDate : min,
          matchedResources[0].startDate
        ),
        endDate: matchedResources.reduce((max, r) =>
          new Date(r.endDate) > new Date(max) ? r.endDate : max,
          matchedResources[0].endDate
        ),
        weekendWorkAllowed: matchedResources.some(r => r.weekendWorkAllowed),
        billable: matchedResources.some(r => r.billable),
        allocations: matchedResources
      }
      : null;
    console.log(matchedResources);


    const resourceDateRange = mergedResource ? {
      startDate: mergedResource.startDate ? new Date(mergedResource.startDate) : null,
      endDate: mergedResource.endDate ? new Date(mergedResource.endDate) : null
    } : undefined;
    console.log(resourceDateRange);

    const phaseDateRange = mergedResource?.phase ? {
      startDate: mergedResource.phase.startDate ? new Date(mergedResource.phase.startDate) : null,
      endDate: mergedResource.phase.endDate ? new Date(mergedResource.phase.endDate) : null
    } : undefined;

    // Normalize date
    const normalizeDate = (date: any) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const entryDate = normalizeDate(day.dateObj);

    // ✅ Find allocation for THIS DAY
    const matchedAllocation = matchedResources?.find((r: any) => {
      const start = normalizeDate(r.startDate);
      const end = normalizeDate(r.endDate);
      return entryDate >= start && entryDate <= end;
    });

    // ✅ Weekend allowed per allocation or row-level resource
    const weekendAllowed = matchedAllocation?.weekendWorkAllowed ?? mergedResource?.weekendWorkAllowed ??
      (row.isWeekendAllowedProject || row.isWeekendAllowedClient);

    // ✅ Use day-specific allocation for validation when available
    const selectedResourceForDay = matchedAllocation || mergedResource;

    // ✅ Validation context
    const validationContext: ValidationContext = {
      selectedResource: selectedResourceForDay,
      matchedAllocation,
      holidays: this.holidaysData,
      weekends: this.weekendsData,
      leaves: this.leavesData
    };

    // ✅ Call validation
    const dayStatus = this.dayValidationService.checkDayStatus(entryDate, validationContext);

    // ✅ Check if there's an allocation for this specific day
    const hasAllocation = !!matchedAllocation;
    const allocationBlocked = !hasAllocation && mergedResource; // Block if no allocation but resource exists

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFutureDate = day.dateObj > today;
    const isCurrentEmployee = this.employeeId === this.empdata?.employeeId;
    const isBlocked = dayStatus.blocked || allocationBlocked;
    const blockReason = allocationBlocked ? 'No Allocation for This Day' : dayStatus.blockReason;
    const baseLocked = isCellLocked(
      cell, day, row,
      resourceDateRange,
      phaseDateRange,
      isFutureDate,
      isCurrentEmployee,
      isBlocked
    );

    const isWeekend = dayStatus.blockReason === 'Weekend' || day.blockReason === 'Weekend' || cell.blockReason === 'Weekend';
    const isLocked = baseLocked && !(isWeekend && weekendAllowed);

    cell.isLocked = isLocked;
    if (allocationBlocked && !dayStatus.blocked) {
      cell.blockReason = 'No Allocation for This Day';
      cell.isBlocked = true;
    }

    const isNotEntered = cell.approvalStatus === ApprovalStatus.NotEntered;
    const shouldEnable = isProjectSelected && !isLocked;

    const billablecheck = !!(mergedResource?.billable || this.selectedProjectResource?.billable);

    const durationControl = this.fb.control(
      isNotEntered ? '' : cell.durationSeconds ? this.secondsToHHMM(cell.durationSeconds) : '',
      Validators.required
    );

    if (!shouldEnable) {
      durationControl.disable({ emitEvent: false });
    }

    return this.fb.group({
      entryId: [{ value: cell.entryId || null, disabled: !shouldEnable }],
      approverId: [{ value: cell.approverId || null, disabled: !shouldEnable }],
      clientName: [{ value: row.clientName, disabled: !shouldEnable }],
      clientId: [{ value: row.clientId, disabled: !shouldEnable }],
      projectId: [{ value: row.projectId, disabled: !shouldEnable }],
      projectName: [{ value: row.projectName, disabled: !shouldEnable }],
      phaseId: [{ value: row.phaseId, disabled: !shouldEnable }],
      phaseName: [{ value: row.phaseName, disabled: !shouldEnable }],
      entryDate: [{ value: cell.entryDate, disabled: !shouldEnable }],
      startTime: [{ value: isNotEntered ? '' : cell.startTime || '', disabled: !shouldEnable }],
      endTime: [{ value: isNotEntered ? '' : cell.endTime || '', disabled: !shouldEnable }],
      duration: durationControl,
      description: [{ value: isNotEntered ? null : cell.description || null, disabled: !shouldEnable }, [Validators.required]],
      approvalStatus: [{ value: cell.approvalStatus, disabled: !shouldEnable }],
      isBillable: [{ value: cell.isBillable, disabled: !billablecheck }],
      isLeave: [{ value: cell.isLeave, disabled: true }],
      isBlocked: [{ value: cell.isBlocked, disabled: true }],
      rejectReason: [cell.rejectReason || ''],
      blockReason: [cell.blockReason || ''],
      resourceId: [row.resourceId || null],
      taskId: [{ value: cell.taskId || null, disabled: !billablecheck }],
      pendingApprovalDetails: [cell.pendingApprovalDetails || null],
      taskName: [cell.taskName || null]
    });
  }


  isReportee = false;
  onCheckemployee(employeed: any, dropdownType?: string) {
    this.employeeSelected = !!employeed;
    const formattedStart = moment(this.start).format('YYYY-MM-DD');
    if (employeed && dropdownType === 'team') {
      this.employeeId = employeed.id;
      this.isReportee = employeed.isReportee;
      this.selectedResource = employeed;
      this.getTimeSheetEntriesbyEmployeeId(this.empdata.employeeId, formattedStart);
      this.getResourceData()
      this.getJobDetails()
    }
    else if (employeed && dropdownType === 'all employees') {
      this.employeeId = employeed;
      this.selectedResource = {
        id: employeed,
        name: null,
        fusionEmpId: null,
        workMail: null,
        isReportee: false,
        key: 'all employees'
      };
      this.getTimeSheetEntriesbyEmployeeId(this.employeeId, formattedStart);
      this.getResourceData()
      this.getJobDetails()
    }
  }

  mytimesheet() {
    this.employeeId = this.empdata.employeeId;
    this.employeeSelected = false;
    if (this.employeeDropdown) {
      this.employeeDropdown.clear();
    }
    const formattedStart = moment(this.start).format('YYYY-MM-DD');
    this.getTimeSheetEntriesbyEmployeeId(this.employeeId, formattedStart);
    this.getResourceData()
    this.getJobDetails()
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empdata?.employeeId;
    const satus = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  // function to get the data of employees by hierarchy
  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = parseInt(this.empdata.employeeId);
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          // No filter
          this.getEmployeeInfo = response.map((employee: any) => ({
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName}
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          }));
        }
      },
    });
  }

  getDraftEntryIdsByProject(projectIndex: number): number[] {
    const projectForm = this.projects.at(projectIndex);
    if (!projectForm) return [];

    const rowId = projectForm.get('rowId')?.value;
    if (!rowId || !this.weekMatrix) return [];

    const entryIds: number[] = [];

    this.weekMatrix.days.forEach(day => {
      const cellKey = `${rowId}_${day.date}`;
      const cell = this.weekMatrix.cellMap.get(cellKey);

      if (cell && cell.entryId &&
        (cell.approvalStatus === ApprovalStatus.Draft ||
          cell.approvalStatus === ApprovalStatus.NotEntered)) {
        entryIds.push(cell.entryId);
      }
    });

    return entryIds;
  }

  openModalforsubmit(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openModalfordeletealldata(content: any, index: number) {
    this.rowdelete = index;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  removeProject(index: number) {
    // Get all draft entry IDs for this project
    const draftEntryIds = this.getDraftEntryIdsByProject(index);
    if (draftEntryIds.length > 0) {
      const payload = {
        timesheetId: this.timesheetdata.timesheetId,
        entryIds: draftEntryIds,
      };
      this.http.DeleteData('Timesheet/delete-entries', payload).subscribe({
        next: (res) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Draft entries deleted successfully');
          this.projects.removeAt(index);
          this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
          this.getTimeSheetEntriesbyEmployeeId(
            this.employeeId,
            this.formattedweakendStart
          );
          // remove project from form array after successful delete
          this.projects.removeAt(index);
          if (this.projects.length === 0) {
            this.addProject();
          }
        },
        error: (err: any) => {
          this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to delete time entry');
        },
      });
    } else {
      // No draft entries → just remove project from UI
      this.projects.removeAt(index);
      if (this.projects.length === 0) {
        this.addProject();
      }
      this.modalService.dismissAll();
      this.conformationPopup.openSuccessModal('Row deleted successfully');
    }
  }

  ///helper method to update week range
  setWeekRange(start: moment.Moment, end: moment.Moment) {
    this.start = start.toDate();
    this.end = end.toDate();
    this.date = [this.start, this.end];
    this.displayLabel = `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
    this.weakstartdate = start.toDate();
    this.weakenddate = end.toDate();
  }

  // previous week
  previousWeek() {
    if (this.start && this.end) {
      const prevStart = moment(this.start).subtract(7, 'days').startOf('day');
      const prevEnd = moment(this.end).subtract(7, 'days').endOf('day');
      this.start = prevStart.toDate();
      this.end = prevEnd.toDate();
      this.weakstartdate = this.start;
      this.weakenddate = this.end;
      this.setWeekRange(prevStart, prevEnd);
      this.checkTimesheetLockByMonth(prevStart.toDate(), prevEnd.toDate()); //
      const formattedStart = moment(prevStart).format('YYYY-MM-DD');
      this.loadTimeSheetByResource(formattedStart);
    }
  }

  // next week
  nextWeek() {
    if (this.start && this.end) {
      const nextStart = moment(this.start).add(7, 'days').startOf('day');
      const nextEnd = moment(this.end).add(7, 'days').endOf('day');
      this.start = nextStart.toDate();
      this.end = nextEnd.toDate();
      this.weakstartdate = this.start;
      this.weakenddate = this.end;
      this.setWeekRange(nextStart, nextEnd);
      this.checkTimesheetLockByMonth(nextStart.toDate(), nextEnd.toDate());
      const formattedStart = moment(nextStart).format('YYYY-MM-DD');
      this.loadTimeSheetByResource(formattedStart);
    }
  }

  //GET DATA to show in table
  getTimeSheetEntriesbyEmployeeId(employeeId: number, start: any) {
    this.loading = true;
    const query = `weekStartDate=${start}`;

    this.http.getData(`v2/Timesheet/week/employee/${employeeId}?${query}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.updateValidationContext();
          // Transform V2 response to matrix model
          this.weekMatrix = transformV2ResponseToWeekMatrix(res);
          this.timesheetdata = res.data;

          // Update component state
          this.totalDuration = this.secondsToHHMM(this.weekMatrix.metadata.totalDurationSeconds);
          this.start = new Date(this.weekMatrix.metadata.weekStartDate);
          this.end = new Date(this.weekMatrix.metadata.weekEndDate);
          this.weekStartDate = this.start;
          this.weekEndDate = this.end;

          // Set week dates from matrix
          this.weekDates = this.weekMatrix.days.map(d => d.dateObj);

          // Rebuild form from matrix
          this.rebuildFormFromMatrix();
        },
        error: (err) => {
          this.loading = false;
        }
      });
  }

  private rebuildFormFromMatrix() {
    this.projects.clear();

    if (this.weekMatrix.rows.length > 0) {
      // Ensure validation context is updated before processing rows
      this.weekMatrix.rows.forEach(row => {
        const isNoClientProject = row.isNoClientProject ?? false;
        const hasProjectData = row.projectId && row.projectName;
        const isProjectSelected = !!(hasProjectData || isNoClientProject);
        this.addProjectFromRow(row, isProjectSelected);


      });
    } else {
      this.addProject();
    }
  }

  //GET CLIENT AND PROJECT
  getResourceData() {
    this.http.getDataIncludeParams(`ProjectResource?status=active&employeeId=${this.employeeId}&isProjectRequired=true`).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res.success) {
        this.resourcesArrayList = res.data;
        const rawData = res.data;
        this.clients = rawData.reduce((acc: any[], curr: any) => {
          const clientId = curr?.client?.clientId || 0;
          let existingClient = acc.find((c) => c.clientId === curr.client.clientId);
          // Build phase object (if exists)
          const phaseObj = curr.phase ? {
            phaseId: curr.phase.phaseId,
            phaseName: curr.phase.phaseName,
            allocatedHours: curr.phase.allocatedHours,
            status: curr.phase.status,
            startDate: curr.phase.startDate,
            endDate: curr.phase.endDate,
            meta: curr.phase.meta || null,
            color: curr.phase.meta?.graphData?.color || null
          } : null;
          const projectObj = {
            projectId: curr?.project?.projectId,
            projectName: curr?.project?.projectName,
            startDate: curr?.startDate,
            endDate: curr?.endDate,
            status: curr?.status,
            role: curr?.role,
            isWeekendAllowed: curr?.project?.isWeekendAllowed || curr?.client?.isWeekendAllowed,
            isOverTimeAllowed: curr?.project?.isOverTimeAllowed || curr?.client?.isOverTimeAllowed,
            isBillable: curr?.project?.isbillable || curr?.client?.isbillable,
            phases: phaseObj ? [phaseObj] : [],
            meta: curr?.project?.meta || null,
            color: curr?.project?.meta?.graphData?.color || null
          }
          if (!existingClient) {
            // Create new client
            existingClient = {
              clientId: clientId,
              clientName: curr?.client?.clientName || 'No Client',
              projects: [],
              shift: curr?.shift,
              meta: curr?.client?.meta || null,
              color: curr?.client?.meta?.graphData?.color || null
            };
            acc.push(existingClient);
          }
          // Find existing project in that client
          let existingProject = existingClient.projects.find(
            (p: any) => p.projectId === projectObj.projectId
          );

          if (!existingProject) {
            // Add new project
            existingClient.projects.push(projectObj);
          } else if (phaseObj) {
            // Add phase only if not already present
            const phaseExists = existingProject.phases.some(
              (ph: any) => ph.phaseId === phaseObj.phaseId
            );
            if (!phaseExists) {
              existingProject.phases.push(phaseObj);
            }
          }
          return acc;
        }, []);
        // If "No Client/Project" flag is not set, add it manually
        if (!this.noclientproject) {
          this.clients.unshift({
            clientId: 0,
            clientName: 'No Client',
            projects: [
              {
                projectId: 0,
                projectName: 'No Project',
                phases: [],
                startDate: null,
                endDate: null,
                status: null,
                role: null,
                isWeekendAllowed: false,
                isOverTimeAllowed: false,
                isBillable: false,
                isNoClientProject: true,
              },
            ],
          });
        }
      }
    });
  }

  // Calculate total hours across all projects (weekly total)
  getTotalHoursAllProjects(): string {
    let totalMinutes = 0;
    this.projects.controls.forEach((project) => {
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      days.forEach((day) => {
        const duration = project.get([day, 'duration'])?.value;
        if (duration) {
          const [hh, mm] = duration.split(':').map(Number);
          totalMinutes += hh * 60 + (mm || 0);
        }
      });
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Calculate total hours per day (column total)
  getTotalPerDay(day: string): string {
    const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(day);
    if (dayIndex === -1 || !this.weekMatrix) return '00:00';

    const dayModel = this.weekMatrix.days[dayIndex];
    const total = this.weekMatrix.totals.get(dayModel.date) || 0;
    return this.secondsToHHMM(total);
  }

  getJobDetails() {
    let EmployeeId = this.employeeId;
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobdetails = data[0];
        this.effectiveDate = new Date(this.jobdetails.effectiveDate);
      },
      error: (data: any) => {
        console.log(data);
      },
    });
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empdata?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data
            // Remove employee by ID
            .filter((emp: IResourceDetail) => emp.id !== EmployeeId)
            // Add fullName for dropdown
            .map((emp: IResourceDetail) => ({
              ...emp,
              fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
              key: 'team'
            }));
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  // Check if daily total exceeds 8 hours
  isDayExceeded(day: string): boolean {
    let totalMinutes = 0;
    this.projects.controls.forEach((project) => {
      const duration = project.get([day, 'duration'])?.value;
      if (duration) {
        const [hh, mm] = duration.split(':').map(Number);
        totalMinutes += hh * 60 + (mm || 0);
      }
    });
    return totalMinutes > 8 * 60;
  }

  // Allow only numbers in time input
  allowNumbersOnly(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':'];
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  private isDeleteModalOpen = false;
  private userClickedNo = false;
  private isModalOpen = false;
  private autoSaveTimeouts = new Map<string, any>();

  // Check if user is trying to clear duration for draft entries
  checkClearDuration(event: KeyboardEvent, dayName: string, rowIndex: number) {
    if (this.isDeleteModalOpen) {
      event.preventDefault();
      return;
    }
    const target = event.target as HTMLInputElement;
    const dayForm = this.projects.at(rowIndex).get(dayName) as FormGroup;
    const approvalStatus = dayForm?.get('approvalStatus')?.value;
    const entryId = dayForm?.get('entryId')?.value;
    // If user presses Delete/Backspace and field has value and status is draft
    if ((event.key === 'Delete' || event.key === 'Backspace') &&
      target.value &&
      approvalStatus?.toLowerCase() === 'draft' &&
      entryId) {
      // Check if this action would clear the entire field
      const willClearField = (target.selectionStart === 0 && target.selectionEnd === target.value.length) ||
        (target.value.length === 1 && (target.selectionStart === 0 || target.selectionEnd === target.value.length));
      if (willClearField) {
        event.preventDefault();
        this.isDeleteModalOpen = true;
        this.opendeleteModal(this.deleteconformation, entryId);
      }
    }
  }


  //TIME ENTERIY FOR TABLE
  formatTime(event: any, dayName: string, rowIndex: number, duration: string, dayFormNew: AbstractControl | null) {
    // project.get('sun')
    let value = event.target.value;
    value = value?.replace(/\D/g, ''); // digits only
    let formatted = this.getFormattedTime(value);
    const dayForm = this.projects.at(rowIndex).get(dayName) as FormGroup;
    const approvalStatus = dayForm?.get('approvalStatus')?.value;
    const control = this.projects.at(rowIndex).get(`${dayName}.${duration}`);
    if (control) {
      control.setValue(formatted, { emitEvent: false });
    }
    // Show dots only if there's a formatted duration value
    if (formatted) {
      this.showDots[rowIndex][dayName] = true;
    }
    // Auto-save only on blur to prevent duplicate calls
    if (formatted && (event.type === 'blur' || event.type === 'keyup') && !this.isDeleteModalOpen && !this.userClickedNo && !this.isModalOpen) {


      const timeoutKey = `${rowIndex}-${dayName}`;
      // Clear any existing timeout for this specific field
      if (this.autoSaveTimeouts.has(timeoutKey)) {
        clearTimeout(this.autoSaveTimeouts.get(timeoutKey));
      }
      // Don't auto-save if already processed or waiting for approval
      if (approvalStatus !== 'Processed' && approvalStatus !== 'Waiting for Approval' &&
        !((approvalStatus?.toLowerCase() === 'draft' || approvalStatus?.toLowerCase() === 'rejected') && event.type === 'blur')
      ) {

        // Add small delay to prevent rapid successive calls
        const timeout = setTimeout(() => {
          this.openModal(this.addtask, dayFormNew, rowIndex, dayName);
          // this.autoSaveTableEntry(rowIndex, dayName,dayFormNew);
          // this.autoSaveTimeouts.delete(timeoutKey);
        }, 300);
        this.autoSaveTimeouts.set(timeoutKey, timeout);
      }
    }
    // Reset userClickedNo flag after processing
    if (event.type === 'blur') {
      this.userClickedNo = false;
    }
  }

  //AUTO SAVE TABLE ENTRY
  // autoSaveTableEntry(rowIndex: number, dayName: string,dayFormNew: AbstractControl | null) {
  //   const projectForm = this.projects.at(rowIndex);
  //   const dayForm = projectForm.get(dayName) as FormGroup;
  //   if (!dayForm || !dayForm.get('duration')?.value) return;
  //   const formValue = dayForm.value;
  //   const projectValue = projectForm.value;
  //   // Get the correct date based on dayName
  //   const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(dayName);
  //   const entryDate = this.weekDates && this.weekDates[dayIndex]
  //     ? moment(this.weekDates[dayIndex]).format('YYYY-MM-DD')
  //     : moment().format('YYYY-MM-DD');
  //   // Determine billable status
  //   const selectedResource = this.resourcesArrayList.find(
  //     (res: any) => res.project?.projectId === formValue.projectId &&
  //       res.client?.clientId === formValue.clientId &&
  //       res.phase?.phaseId === formValue.phaseId
  //   );
  //   const isBillable = this.selectedProjectResource?.billable ?? selectedResource?.billable ?? false;
  //   const payload = {
  //     entryId: formValue.entryId || null,
  //     employeeId: this.employeeId || null,
  //     entryDate: entryDate,
  //     startTime: formValue.startTime || null,
  //     endTime: formValue.endTime || null,
  //     description: formValue.description || null,
  //     approvalStatus: 'draft',
  //     clientId: projectValue.selectedProject?.clientId || null,
  //     projectId: projectValue.selectedProject?.projectId || null,
  //     phaseId: projectValue.selectedProject?.phaseId || null,
  //     timesheetId: this.timesheetdata?.timesheetId || null,
  //     isOverride: formValue.isBlocked || false,
  //     totalDurationSeconds: this.hhmmToSeconds(formValue.duration) || 0,
  //     isBillable: isBillable,
  //      moduleId: 30,
  //   };
  //   this.http.postdata('Timesheet/save-or-update', payload).subscribe({
  //     next: (res) => {
  //       this.conformationPopup.openSuccessModal('Time Entry Draft successfully');
  //       this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
  //         setTimeout(() => {

  //       }, 3000);
  //       // this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);

  //     },
  //     error: (err) => {
  //       console.error('Auto-save failed', err);
  //       // this.conformationPopup.openErrorModal(err.error.message);
  //       this.errormodaldata = err.error.message;
  //       const modalRef = this.modalService.open(this.errormodal, { centered: true });
  //       // Auto close the error modal after 3 seconds
  //       setTimeout(() => {
  //         modalRef.close();
  //       }, 3000);
  //       this.errorOccurred = true;
  //       dayForm.reset();
  //       // this.conformationPopup.openErrorModal(err.error.message);
  //       this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
  //     },
  //   });
  // }

  //TIME FORMAT FOR MODAL
  formatModalTime(event: any) {
    let value = event.target.value;
    value = value?.replace(/\D/g, ''); // digits only
    let formatted = this.getFormattedTime(value);
    this.dayForm.get('duration')?.setValue(formatted, { emitEvent: false });
  }

  //COMMON TIME FORMATTING LOGIC
  getFormattedTime(value: string): string {
    let formatted = '';
    if (value?.length === 1) {
      // Single digit = minutes (0-9 minutes)
      let minutes = parseInt(value, 10);
      formatted = `00:0${minutes}`;
    } else if (value?.length === 2) {
      // Two digits = tens place minutes (10-59 minutes)
      let minutes = parseInt(value, 10);
      if (minutes > 59) minutes = 59;
      formatted = `00:${minutes.toString().padStart(2, '0')}`;
    } else if (value?.length === 3) {
      // Three digits = hours (1-24 hours)
      let hours = parseInt(value[0], 10);
      let minutes = parseInt(value.slice(1), 10);
      if (hours > 24) hours = 24;
      if (minutes > 59) minutes = 59;
      if (hours === 24) minutes = 0;
      formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (value?.length === 4) {
      // Four digits = hours and minutes
      let hours = parseInt(value.slice(0, 2), 10);
      let minutes = parseInt(value.slice(2), 10);
      if (hours > 24) hours = 24;
      if (minutes > 59) minutes = 59;
      if (hours === 24) minutes = 0;
      formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return formatted;
  }

  opendeleteModal(content: any, data: any) {
    this.selectedentryid = data;
    this.userClickedNo = false;
    const modalRef = this.modalService.open(content, { centered: true, backdrop: 'static' });
    // Reset flag when modal is closed
    modalRef.result.finally(() => {
      this.isDeleteModalOpen = false;
    });
  }

  // Handle No button click in delete modal
  onDeleteModalNo() {
    this.userClickedNo = true;
    this.modalService.dismissAll();
    this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
    this.getTimeSheetEntriesbyEmployeeId(
      this.employeeId,
      this.formattedweakendStart
    );
  }

  //single entry delete
  deletesingleentry() {
    const payload = {
      timesheetId: this.timesheetdata.timesheetId,
      entryIds: [this.selectedentryid],
    };
    this.http.DeleteData('Timesheet/delete-entries', payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Time Entry is deleted successfully');
        this.selectedentryid = null;
        this.isDeleteModalOpen = false;
        this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
        this.getTimeSheetEntriesbyEmployeeId(
          this.employeeId,
          this.formattedweakendStart
        );
      },
      error: (err: any) => {
        console.error('Delete failed', err);
        this.conformationPopup.openErrorModal(
          err?.error?.message || 'Failed to delete time entry'
        );
        this.isDeleteModalOpen = false;
      },
    });
  }

  // dropdown filter
  // Filter Clients, Projects, and Phases based on search term
  getFilteredClientsForRow(project: AbstractControl): any[] {
    const term = (project.get('searchTerm')?.value || '').trim().toLowerCase();
    if (!term) return this.clients;
    return this.clients.map((client) => {
      // If client name matches
      if (client.clientName.toLowerCase().includes(term)) {
        return client;
      }
      // Filter projects inside client
      const filteredProjects = client.projects.map((proj: any) => {
        // If project name matches
        if (proj.projectName.toLowerCase().includes(term)) {
          return proj;
        }
        // Otherwise filter by phase name
        const filteredPhases = proj.phases?.filter((ph: any) =>
          ph.phaseName?.toLowerCase().includes(term)
        );
        if (filteredPhases && filteredPhases.length > 0) {
          return { ...proj, phases: filteredPhases };
        }
        return null;
      }).filter((p: any) => p !== null);
      if (filteredProjects.length > 0) {
        return { ...client, projects: filteredProjects };
      }

      return null;
    })
      .filter((c: any) => c && c.projects.length > 0);
  }

  // Helper method to determine if a date is weekend/holiday/leave
  getDayStatus(date: Date): { isBlocked: boolean; blockReason: string; isLeave: boolean } {
    if (!this.weekMatrix) {
      return { isBlocked: false, blockReason: '', isLeave: false };
    }

    const day = this.weekMatrix.days.find(d => {
      const dayDate = new Date(d.date);
      dayDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === checkDate.getTime();
    });

    return {
      isBlocked: day?.isBlocked || false,
      blockReason: day?.blockReason || '',
      isLeave: day?.isLeave || false
    };
  }

  // Helper method to check if a date is valid for the selected phase
  isDateValidForPhase(date: Date, selectedResource: any): boolean {
    if (!selectedResource?.phase) {
      return true; // No phase restrictions
    }
    const phaseStartDate = selectedResource.phase.startDate ? new Date(selectedResource.phase.startDate) : null;
    const phaseEndDate = selectedResource.phase.endDate ? new Date(selectedResource.phase.endDate) : null;
    if (phaseStartDate) {
      phaseStartDate.setHours(0, 0, 0, 0);
      if (date < phaseStartDate) {
        return false;
      }
    }
    if (phaseEndDate) {
      phaseEndDate.setHours(0, 0, 0, 0);
      if (date > phaseEndDate) {
        return false;
      }
    }
    return true;
  }

  onDropdownClick(event: MouseEvent) {
    if (!this.employeeSelected) {
      event.stopPropagation(); // stop event bubbling
      event.preventDefault();  // stop Bootstrap dropdown from opening
    }
  }

  selectedProject: { clientName: string; projectName: string } | null = null;


  private updateValidationContext() {
    const context: ValidationContext = {
      selectedResource: this.selectedProjectResource,
      holidays: this.holidaysData,
      weekends: this.weekendsData,
      leaves: this.leavesData
    };
    this.dayValidationService.initialize(context);
  }

  selectProjectForRow(row: AbstractControl, client: any, project: any, phase: any = null) {

    const form = row as FormGroup;

    // ✅ Get ALL matching resources
    const selectedResources = this.resourcesArrayList.filter(
      (res: any) =>
        res.project?.projectId === project.projectId &&
        res?.phase?.phaseId === (phase ? phase.phaseId : null) &&
        res.client?.clientId === client.clientId
    );

    // ✅ Merge ONLY for date range (NOT billable/weekend logic)
    const selectedProjectResource = selectedResources.length
      ? {
        ...selectedResources[0],

        startDate: selectedResources.reduce((min, r) =>
          new Date(r.startDate) < new Date(min) ? r.startDate : min,
          selectedResources[0].startDate
        ),

        endDate: selectedResources.reduce((max, r) =>
          new Date(r.endDate) > new Date(max) ? r.endDate : max,
          selectedResources[0].endDate
        ),

        // ✅ Preserve weekend permission across rows
        weekendWorkAllowed: selectedResources.some(r => r.weekendWorkAllowed),
        billable: selectedResources.some(r => r.billable),

        // ❗ Keep allocations for per-day logic
        allocations: selectedResources
      }
      : null;

    // ✅ Set component-level variables
    this.selectedclientid = client.clientId;
    this.selectedprojectid = project.projectId;
    this.selectedClientname = client.clientName;
    this.selectedProjectName = project.projectName;
    this.selectedPhaseId = phase ? phase.phaseId : null;
    this.selectedPhaseName = phase ? phase.phaseName : null;
    this.selectedProjectResource = selectedProjectResource;
    this.resourceId = selectedResources[0]?.resourceId;

    // ✅ Patch main form
    form.patchValue({
      clientId: client.clientId,
      projectId: project.projectId,
      clientName: client.clientName,
      projectName: project.projectName,
      phaseId: phase ? phase.phaseId : null,
      phaseName: phase ? phase.phaseName : null,
      resourceId: selectedResources[0]?.resourceId,
      selectedProjectResource: selectedProjectResource,
      selectedProject: {
        clientId: client.clientId,
        clientName: client.clientName,
        projectId: project.projectId,
        projectName: project.projectName,
        phaseId: phase ? phase.phaseId : null,
        phaseName: phase ? phase.phaseName : null
      }
    });

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    days.forEach((dayKey, index) => {
      const dayForm = form.get(dayKey) as FormGroup;
      const entryDate = this.weekDates[index];

      // ✅ Find correct allocation for THIS DAY
      const matchedAllocation = selectedResources.find(r => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return entryDate >= start && entryDate <= end;
      });

      const isBillableForDay = matchedAllocation?.billable || false;
      const allocationBlocked = !matchedAllocation && selectedResources.length > 0;
      const weekendAllowed = matchedAllocation?.weekendWorkAllowed ?? selectedProjectResource?.weekendWorkAllowed ?? false;

      const validationContext: ValidationContext = {
        selectedResource: matchedAllocation || selectedProjectResource,
        matchedAllocation,
        holidays: this.holidaysData,
        weekends: this.weekendsData,
        leaves: this.leavesData
      };

      const dayStatus = this.dayValidationService.checkDayStatus(entryDate, validationContext);
      const isWeekend = dayStatus.blockReason === 'Weekend' || dayStatus.blockReason?.toLowerCase() === 'weekend';
      const dayBlocked = dayStatus.blocked && !(isWeekend && weekendAllowed);

      // ✅ Patch each day
      dayForm.patchValue({
        clientId: client.clientId,
        projectId: project.projectId,
        clientName: client.clientName,
        projectName: project.projectName,
        phaseId: phase ? phase.phaseId : null,
        phaseName: phase ? phase.phaseName : null,
        entryDate: entryDate,
        resourceId: matchedAllocation?.resourceId || null,
        isBlocked: dayBlocked || allocationBlocked,
        blockReason: allocationBlocked ? 'No Allocation for This Day' : dayStatus.blockReason,
        isLeave: dayStatus.blockReason === 'Leave'
      });

      // ✅ Enable / Disable fields
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isFutureDate = entryDate > today;
      const shouldEnable = (!dayStatus.blocked || (isWeekend && weekendAllowed)) && !allocationBlocked && !isFutureDate;

      ['duration', 'description', 'startTime', 'endTime'].forEach((ctrl) => {
        shouldEnable ? dayForm.get(ctrl)?.enable() : dayForm.get(ctrl)?.disable();
      });

      // ✅ Billable control (PER DAY FIX)
      isBillableForDay
        ? dayForm.get('isBillable')?.enable()
        : dayForm.get('isBillable')?.disable();
    });

    // ✅ Close dropdown
    const dropdownMenu = document.querySelector('.dropdown-menu.show');
    if (dropdownMenu) dropdownMenu.classList.remove('show');

    const dropdownBtn = document.getElementById('dropdownMenuButton');
    if (dropdownBtn) {
      dropdownBtn.classList.remove('show');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }


  }

  getClientColor(clientId: number): string {
    const client = this.clients.find(c => c.clientId === clientId);
    return client?.color;
  }

  getPhaseColor(phaseId: number): string {
    for (const client of this.clients) {
      for (const project of client.projects) {
        const phase = project.phases.find((p: any) => p.phaseId === phaseId);
        if (phase) return phase.color
      }
    }
    return '#0B3A83';
  }

  getProjectColor(projectId: number): string {
    for (const client of this.clients) {
      const project = client.projects.find((p: any) => p.projectId === projectId);
      if (project) return project.color;
    }
    return '#0B3A83';
  }

  hasUnselectedProjectPhases(client: any): boolean {
    return client.projects.some((project: any) => {
      if (project.phases && project.phases.length > 0) {
        return project.phases.some(
          (phase: any) => !this.selectedPhaseIds.includes(phase.phaseId)
        );
      }
      const isNoClientProject = client.clientId === 0 && project.projectId === 0;
      if (isNoClientProject) {
        return !this.selectedPhaseIds.includes(0);
      }
      return !this.selectedPhaseIds.includes(project.projectId);
    });
  }

  showProjectsLength(projects: any[]): number {
    return projects.length;
  }

  hasAnyDuration(project: AbstractControl): boolean {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return days.some(day => project.get(day)?.get('duration')?.value && project.get(day)?.get('approvalStatus')?.value?.toLowerCase() !== 'not entered');
  }

  get selectedPhaseIds(): any[] {
    return this.projects.controls.map((ctrl: AbstractControl) => {
      const project = ctrl.value?.selectedProject;
      return project?.phaseId ?? project?.projectId;
    })
      .filter((id) => id !== undefined && id !== null);
  }

  //OPEN TIME ENTERIY
  openModal(content: any, dayForm: AbstractControl | null, index: number, dayKey: string) {

    if (dayForm instanceof FormGroup) {
      this.currentRowIndex = index;
      this.currentDay = dayKey;
      this.isModalOpen = true;
      const modalRef = this.modalService.open(content, {
        centered: true,
        backdrop: 'static'
      });
      modalRef.result.finally(() => {
        this.isModalOpen = false;
      });

      this.dayForm = dayForm;
      //start//code for the task type 
      let taskId = this.dayForm.get('taskId')?.value;
      console.log('Selected Task ID:', taskId);
      let taskdata = this.alltaskTypes?.find((ele: any) => ele?.id == taskId && ele?.status?.toLowerCase() == 'inactive');
      if (taskdata) {
        const alreadyExists = this.taskType?.some((ele: any) => ele.id == taskdata.id);
        if (!alreadyExists) {
          this.taskType.push(taskdata);
        }
      } else {
        this.taskType = this.alltaskTypes?.filter((ele: any) => ele?.status?.toLowerCase() == 'active'
        );
      }
      this.getTimesheetMadatorydata(this.dayForm.get('projectId')?.value, this.dayForm.get('phaseId')?.value)
      //end//code for the task type
      // ✅ Normalize date (fix timezone issue)
      const normalizeDate = (date: any) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const entryDate = normalizeDate(this.dayForm.get('entryDate')?.value);

      // ✅ 🔥 Get correct resource based on project/client/phase + DATE RANGE
      const matchedResource = this.resourcesArrayList
        .filter((res: any) =>
          res.project?.projectId === this.dayForm.get('projectId')?.value &&
          res.client?.clientId === this.dayForm.get('clientId')?.value &&
          res.phase?.phaseId === this.dayForm.get('phaseId')?.value
        )
        .filter((res: any) => {
          const start = normalizeDate(res.startDate);
          const end = normalizeDate(res.endDate);
          return entryDate >= start && entryDate <= end;
        })
        // ✅ If multiple matches → pick latest (optional but safe)
        .sort((a: any, b: any) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )[0];

      console.log('Matched Resource (by date):', matchedResource);

      let isBillableForDay = false;

      if (matchedResource) {
        isBillableForDay = matchedResource.billable === true;
      }

      console.log('Final Billable:', isBillableForDay);

      // ✅ Disable form for processed حالات
      if (
        this.dayForm.get('approvalStatus')?.value === 'Processed' ||
        this.dayForm.get('approvalStatus')?.value === 'Waiting for Approval' ||
        this.employeeSelected
      ) {
        this.dayForm.disable();
      } else {

        this.dayForm.enable();

        // ✅ Enable / Disable billable checkbox
        if (isBillableForDay) {
          this.dayForm.get('isBillable')?.enable();
        } else {
          this.dayForm.get('isBillable')?.disable();
        }
      }

      // ✅ Set default billable only if not entered
      const approvalStatus = this.dayForm.get('approvalStatus')?.value;

      if (
        approvalStatus === 'Not Entered' ||
        approvalStatus === '' ||
        approvalStatus === null ||
        approvalStatus === undefined
      ) {
        this.dayForm.patchValue({
          isBillable: isBillableForDay
        });
      }
    }

  }
  getTimesheetMadatorydata(projectId: number, phaseId: number) {
    const url = `TimesheetConfiguration?projectId=${projectId ?? 0}&phaseId=${phaseId ?? 0}`;

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {

        const items = res?.items || [];

        const fieldMap: any = {
          'Start Time': 'startTime',
          'End Time': 'endTime',
          'Task Type': 'taskId',
          'Description': 'description'
        };
        const selectedDate = moment(this.dayForm.get('entryDate')?.value).format('YYYY-MM-DD');
        console.log('Selected Date for Validation:', selectedDate);
        items.forEach((item: any) => {
          const controlName = fieldMap[item.fieldName];
          if (!controlName) return;
          const control = this.dayForm.get(controlName);
          if (!control) return;
          control.clearValidators();
          const effectiveDate = moment(item.effectiveDate).format('YYYY-MM-DD');
          console.log(effectiveDate)
          const isEffective = moment(selectedDate).isSameOrAfter(moment(effectiveDate), 'day');
          const approvalstatus = this.dayForm.get('approvalStatus')?.value;
          console.log('Approval Status:', approvalstatus);
          if (isEffective && item.isMandatory && (!approvalstatus || approvalstatus?.toLowerCase() === 'draft' || approvalstatus?.toLowerCase() === 'rejected' || approvalstatus?.toLowerCase() === 'not entered')) {
            control.setValidators([Validators.required]);
          }
          control.updateValueAndValidity({ emitEvent: false });
        });
      }
    });
  }
  isRequired(controlName: string): boolean {
    const control = this.dayForm?.get(controlName);

    return control
      ? control.hasValidator(Validators.required)
      : false;
  }
  recalculateTimes(dayKey: string, startIndex: number) {
    for (let i = 0; i < this.projects.length; i++) {
      const projectForm = this.projects.at(i).get(dayKey) as FormGroup;
      const duration = projectForm.get('duration')?.value;
      let startTime: string | undefined;
      let endTime: string | undefined;
      // Try to find last filled endTime from previous projects
      for (let j = i - 1; j >= 0; j--) {
        const prevEnd = this.projects.at(j).get(dayKey)?.get('endTime')?.value;
        if (prevEnd) {
          startTime = prevEnd;
          break;
        }
      }
      // If no previous endTime found, look forward for next filled project's startTime
      if (!startTime) {
        for (let j = i + 1; j < this.projects.length; j++) {
          const nextStart = this.projects.at(j).get(dayKey)?.get('startTime')?.value;
          const nextEnd = this.projects.at(j).get(dayKey)?.get('endTime')?.value;
          if (nextStart && nextEnd) {
            startTime = nextEnd; // Use next project's endTime
            break;
          }
        }
      }
      // If no previous or next filled time, use shift start time
      if (!startTime) {
        startTime = this.selectedShiftDetails?.shiftStartTime;
      }
      // Calculate endTime if duration exists
      if (startTime && duration) {
        const [hours, minutes] = duration.split(':').map(Number);
        endTime = moment(startTime, 'HH:mm:ss').add(hours, 'hours').add(minutes, 'minutes').format('HH:mm:ss');
      }
      projectForm.patchValue({
        startTime: startTime ?? undefined,
        endTime: endTime ?? undefined,
      });
    }
  }

  toTimeSpan = (time: string | null | undefined): string | null => {
    if (!time) return null;
    // If user gave "HH:mm" → make it "HH:mm:00"
    if (/^\d{2}:\d{2}$/.test(time)) {
      return `${time}:00`;
    }
    // If already "HH:mm:ss" → keep it
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    // If API accidentally sends "HH:mm:ss:SS" → trim last ":SS"
    if (/^\d{2}:\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 8); // take only "HH:mm:ss"
    }
    return null;
  };

  //single recoder
  saveDayEntry() {
    this.spinnerLoader = true;
    // Prepare payload
    const formValue = this.dayForm.getRawValue();
    console.log(formValue);

    const payload = {
      entryId: formValue.entryId || 0,
      employeeId: this.employeeId || 0,
      entryDate: moment(this.dayForm.get('entryDate')?.value).format(
        'YYYY-MM-DD'
      ),
      startTime: this.toTimeSpan(formValue.startTime) || null,
      endTime: this.toTimeSpan(formValue.endTime) || null,
      description: formValue.description || '',
      approvalStatus: 'draft',
      clientId: formValue.clientId || null,
      projectId: formValue.projectId || null,
      phaseId: formValue.phaseId || null,
      timesheetId: this.timesheetdata?.timesheetId || null,
      isOverride: formValue.isBlocked || false,
      totalDurationSeconds: this.hhmmToSeconds(formValue.duration) || 0,
      isBillable: formValue.isBillable || false,
      moduleId: 30,
      resourceId: formValue.resourceId || null,
      taskId: formValue.taskId
    };
    // POST request
    this.http.postdata('v2/Timesheet/save-or-update', payload).subscribe({
      next: (res) => {
        this.spinnerLoader = false;
        this.timesheetForm.reset();
        this.modalService.dismissAll();
        this.getResourceData();
        this.conformationPopup.openSuccessModal('Task added successfully');
        this.selectedclientid = null;
        this.selectedprojectid = null;
        this.selectedProjectName = null;
        this.selectedClientname = null;
        this.selectedPhaseId = null;
        this.selectedPhaseName = null;
        this.selectedProjectResource = null;
        this.resourceId = null;
        this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
        this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(err.error.message);
        // console.error('Error saving entry', err);
        // this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
        // this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
      },
    });
  }

  // Helper: convert HH:MM to seconds
  hhmmToSeconds(hhmm: string): number {
    if (!hhmm) return 0;
    const [hours, minutes] = hhmm.split(':').map(Number);
    return (hours || 0) * 3600 + (minutes || 0) * 60;
  }

  openModalforconformation(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    const status = this.dayForm.get('approvalStatus')?.value;

    if (status !== 'Processed' &&
      status !== 'Waiting for Approval' &&
      status !== 'draft' && status !== 'Rejected'
    ) {

      this.dayForm.patchValue({
        duration: null,
        description: null,
        startTime: null,
        endTime: null,
        approvalStatus: 'Not Entered',
        taskId: null,
      }, { emitEvent: true });

      this.timesheetForm.get('duration')?.patchValue(null);

      // Hide icon using existing showDots structure
      if (this.currentRowIndex >= 0 && this.currentDay) {
        this.showDots[this.currentRowIndex][this.currentDay] = false;
      }
    }

    this.modalService.dismissAll();
    this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
  }

  // Add this new helper method
  shouldShowIcon(project: AbstractControl, day: string, rowIndex: number): boolean {
    const dayControl = project.get(day);
    if (!dayControl) return false;

    const duration = dayControl.get('duration')?.value;
    const approvalStatus = dayControl.get('approvalStatus')?.value;
    const showDot = this.showDots[rowIndex]?.[day];

    return !!(showDot || duration || (approvalStatus && approvalStatus.toLowerCase() !== 'not entered'));
  }


  //payload for submit-for-approval
  buildPayload(): any {
    const formValue = this.timesheetForm.getRawValue(); // include disabled fields
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const entries = formValue.projects.flatMap((project: any) =>
      dayKeys.map((dayKey, idx) => {
        const day = project[dayKey];
        if (!day || !day.duration) return null;
        // Only include days with draft approvalStatus
        if (day.approvalStatus !== 'draft') return null;
        return {
          entryId: day.entryId || 0,
          approverId: day.approverId || 0,
          clientId: project.selectedProject?.clientId || 0,
          projectId: project.selectedProject?.projectId || 0,
          phaseId: project.selectedProject?.phaseId || 0,
          entryDate: moment(this.weekDates[idx]).format('YYYY-MM-DD'),
          durationSeconds: this.hhmmToSeconds(day.duration),
          description: day.description || '',
          isOverride: false,
          projectName: project.selectedProject?.projectName || '',
          clientName: project.selectedProject?.clientName || '',
          approvalStatus: day.approvalStatus, // include approvalStatus
          taskId: day.taskId,
        };
      })
    )
      .filter((entry: any) => entry !== null);
    return {
      timesheetId: formValue.timesheetId || this.timesheetdata.timesheetId,
      weekStart: this.formattedweakendStart,
      employeeId: this.employeeId,
      moduleId: 30,
      entries,
    };
  }

  // Call this on Submit button click
  submitTimesheet(): void {
    this.spinnerLoaderforallrecoders = true
    const payload = this.buildPayload();
    this.http.postdata('Timesheet/submit-for-approval', payload).subscribe({
      next: (res: any) => {
        this.spinnerLoaderforallrecoders = false
        //this.modalService.dismissAll();
        //this.conformationPopup.openSuccessModal('Timesheet submitted successfully');
        const successCount = res?.data?.successCount;
        const failureCount = res.data.failedCount;
        this.responseSummary = {
          failedreason: Array.isArray(res?.data?.errors) && res.data.errors.length > 0 ? res.data.errors : 'NA',
          successRecordsCount: successCount,
          failureRecordsCount: failureCount,
          totalRecordsCount: res?.data?.totalCount,
        };
        console.log(this.responseSummary);
        this.modalService.dismissAll();
        const modalRef = this.modalService.open(this.releaseSummaryModal, {
          centered: true,
          size: 'lg',
        });
        setTimeout(() => {
          modalRef.close();
        }, 3000);
        this.selectedclientid = null;
        this.selectedprojectid = null;
        this.selectedProjectName = null;
        this.selectedClientname = null;
        this.selectedPhaseId = null;
        this.selectedPhaseName = null;
        this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
        this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
        this.getApprovalStatusCounts();
      },
      error: (err) => {
        this.modalService.dismissAll();
        this.spinnerLoaderforallrecoders = false;
        console.error('Failed to submit timesheet', err);
        // this.conformationPopup.openSuccessModal(err.error.message);
        this.errormodaldata = err.error.message;
        // this.modalService.open(this.errormodal,{ centered: true });
        const modalRef = this.modalService.open(this.errormodal, { centered: true });
        // Auto close the error modal after 3 seconds
        setTimeout(() => {
          modalRef.close();
        }, 3000);
      },
    });
  }

  navigation() {
    const formData = {
      resourceId: this.empdata?.employeeId,
      dateRange: [this.start, this.end]
    };
    const encryptedData = this.encryptionService.encrypt(formData);
    this.router.navigate(
      ['project-management/timesheet/mysummary'],
      { queryParams: { data: encryptedData } }
    );
  }
  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.timesheetModuleId}&EmployeeId=${this.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
      this.http.updatePendingApprovalCounts(this.totalCount);
      //Map counts to tabs
    });
  }

  canDelete(project?: AbstractControl, index?: number): boolean {
    if (!project) return false;
    const projectId = project.get('projectId')?.value ?? null;
    const projectName = project.get('projectName')?.value ?? '';
    const isNoClientProject = project.get('isNoClientProject')?.value ?? false;
    // List of allowed approval statuses for delete
    const allowedStatuses = ['draft', 'Not Entered', null, '', undefined];
    // Check approval status for each day
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const allDaysEditable = days.every(dayKey => {
      const dayControl = project.get(dayKey) as FormGroup;
      if (!dayControl) return true;
      const approvalStatus = dayControl.get('approvalStatus')?.value;
      return allowedStatuses.includes(approvalStatus);
    });
    // If No Client/Project - follow approval logic also
    if (isNoClientProject === true) {
      return allDaysEditable;  // Allow only if no approved days
    }
    // Prevent delete for empty row
    if (!projectId && !projectName) {
      return false;
    }
    // For normal project, same approval rule
    return allDaysEditable;
  }

  //disable button for sumbit for approval
  isSubmitDisabled(): boolean {
    return this.projects.controls.every((project: AbstractControl) => {
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      // check if any day has draft status
      const hasDraft = days.some(
        (day) => project.get(day)?.value?.approvalStatus === 'draft'
      );
      // disable only if all are blocked AND no draft exists
      return !hasDraft;
    });
  }



  // Check if any of the fields in the day form are filled
  isDayFormDirtyOrFilled(form: FormGroup): boolean {
    const fieldsToCheck = ['description', 'duration', 'startTime', 'endTime', 'taskId'];

    for (const field of fieldsToCheck) {
      const control = form.get(field);

      // Check only if the field has Validators.required
      if (control?.hasValidator(Validators.required)) {
        const value = control.value;

        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          return false;
        }
      }
    }

    return true;
  }
  //based status colour
  getApprovalClass(control: AbstractControl | null): any {
    const status = control?.getRawValue()?.approvalStatus;
    const blockReasons = control?.getRawValue()?.blockReason;
    return {
      approved: status === 'Processed',
      rejected: status === 'Rejected',
      waiting: status === 'Waiting for Approval',
      draft: status === 'draft',
      holiday: blockReasons === 'Holiday',
      // weekend:blockReasons==='Weekend',
      leave: blockReasons === 'Leave',
      'phase-restricted': blockReasons === 'Phase Date Restriction'
    };
  }

  onTimeChange(): void {
    const start = this.dayForm.get('startTime')?.value;
    const end = this.dayForm.get('endTime')?.value;
    if (start && end) {
      const startTime = this.convertToMinutes(start);
      const endTime = this.convertToMinutes(end);
      let diff = endTime - startTime;
      // If end time is on next day (e.g. 22:00 → 02:00)
      if (diff < 0) {
        diff += 24 * 60;
      }
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      const duration = `${this.pad(hours)}:${this.pad(minutes)}`;
      this.dayForm.get('duration')?.setValue(duration, { emitEvent: false });
    }
  }

  private convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  getLighterColor(color: string, amount: number = 0.9): string {
    if (!color) return color || '#d8d8daff'; // Default color if none provided;

    // Remove # if present
    const hex = color.replace('#', '');

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate lighter values
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  getholidaybyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.http.getData(`OrgHolidays/getOrgHoliday/${empdata.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Flatten orgHolidaysItems from all holiday headers
        this.holidaysData = [];
        // if (Array.isArray(res)) {
        // res.forEach((header: any) => {
        if (res.orgHolidaysItems && Array.isArray(res.orgHolidaysItems)) {
          this.holidaysData.push(...res.orgHolidaysItems);
          console.log(this.holidaysData);

        }
        // });
        // }
        this.updateValidationContext();
      },
      error: (err) => console.error('Failed to load holidays', err)
    });
  }

  getweekendbyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.http.getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${empdata.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Flatten orgWeekendItems from all weekend headers
        this.weekendsData = [];
        // if (Array.isArray(res)) {
        //   res.forEach((header: any) => {
        if (res.orgWeekendItems && Array.isArray(res.orgWeekendItems)) {
          this.weekendsData.push(...res.orgWeekendItems);
        }
        //   });
        // }
        this.updateValidationContext();
      },
      error: (err) => console.error('Failed to load weekends', err)
    });
  }

  getleveasdata() {
    this.http.getData(`Timeoff/${this.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.leavesData = response
            .filter(item =>
              item.status === 'Processed' ||
              item.status === 'Waiting for Approval' ||
              item.status === 'Approved'
            )
            .map(item => ({
              startDate: item.startdate,
              endDate: item.enddate,
              durationType: item.durationType
            }));
        }
        this.updateValidationContext();
      },
      error: (err) => console.error('Failed to load leaves', err)
    });
  }

  openCancelClonePopup(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  confirmCloneCancel(modal: any) {
    modal.close();

    this.offcanvasService.dismiss();

    this.conformationPopup.openSuccessModal(
      'Clone Cancelled Successfully'
    );
  }

  testMenu(event: any, menu: any) {
    console.log('Actions Clicked');
    console.log(this.bulkOperationMenuItems);
    console.log(menu);
    menu.show(event);
  }

  approvardetails = {} as any;

  getStatusBadgeClass(status: string): string {
    if (!status) return 'badge-default';
    const s = status.toLowerCase();
    if (s.includes('waiting') || s.includes('pending')) return 'badge-waiting';
    if (s.includes('approved') || s.includes('processed')) return 'badge-approved';
    if (s.includes('rejected')) return 'badge-rejected';
    if (s.includes('draft')) return 'badge-draft';
    return 'badge-default';
  }

  getHeaderClass(status: string): string {
    if (!status) return 'header-default';
    const s = status.toLowerCase();
    if (s.includes('waiting') || s.includes('pending')) return 'header-waiting';
    if (s.includes('approved') || s.includes('processed')) return 'header-approved';
    if (s.includes('rejected')) return 'header-rejected';
    if (s.includes('draft')) return 'header-draft';
    return 'header-default';
  }

  onclickinfo(day?: any) {
    console.log(day.value.pendingApprovalDetails);
    console.log(day);
    console.log(day.get('description')?.value)
    console.log(day.get('taskName')?.value)
    this.approvardetails = day.value.pendingApprovalDetails;
    this.approvardetails.description = day.get('description')?.value
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.http.clearRequestclienttimesheet();
  }
}