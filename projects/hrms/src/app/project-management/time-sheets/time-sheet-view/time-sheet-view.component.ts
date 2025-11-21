import { Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from '../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule, NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { AccordionModule } from 'primeng/accordion';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IResourceDetail, TimesheetResponse } from '../../../timesheetmodel';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { Router } from '@angular/router';
@Component({
  selector: 'app-time-sheet-view',
  imports: [ProjectManagementModuleInfoComponent, NgbDatepickerModule, FormsModule, ReactiveFormsModule,
    NgbPopover, CommonModule, DatePicker, DateformatPipe, AccordionModule, InfoIconComponent, ConfirmationIconComponent,
    TranslateModule, DataLoaderContentComponent, TimesheetsTabsComponent],
  templateUrl: './time-sheet-view.component.html',
  styleUrl: './time-sheet-view.component.scss',
})

export class TimeSheetViewComponent implements OnInit, OnDestroy {
  timesheetForm!: FormGroup;
  loading = false;
  dayForm!: FormGroup;
  jobdetails: any;
  weekStartDate: Date | null = null;
  weekEndDate: Date | null = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  weekDates: Date[] = []; //
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
  effectiveDate: any
  weakstartdate!: Date;
  weakenddate!: Date;
  maxMonth: Date = moment().add(1, 'months').endOf('month').toDate();
  selectedclientid: any;
  selectedprojectid: any;
  selectedPhaseId: any;
  selectedProjectName: any;
  selectedClientname: any;
  selectedPhaseName: any;
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
  @ViewChild('datePicker') datePicker: any;
  @ViewChild('deleteconformation', { static: true }) deleteconformation!: TemplateRef<any>;
  @ViewChild('employeeDropdown') employeeDropdown: any;
   @ViewChild('errormodal') errormodal!: TemplateRef<any>;
   @ViewChild('addtask') addtask!: TemplateRef<any>;
   errorOccurred = false; 
  errormodaldata: any;
    lockMessages: any;
  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService,
    public authService: AuthService, public rbac: RbacService, private conformationPopup: OpenModalService, private router: Router) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = this.empdata?.employeeId;
    const startOfWeek = moment().startOf('isoWeek'); // Sunday by default (you can use .startOf('isoWeek') for Monday)
    const endOfWeek = moment().endOf('isoWeek');
    this.setWeekRange(startOfWeek, endOfWeek);
    this.timesheetForm = this.fb.group({projects: this.fb.array([])});
    this.getResourceDetailsByManagerId();
    this.getResourceData();
    this.getTimesheetLocks();
    this.getJobDetails()
    this.getTeamManagersDetails();
    this.getAllEmployeeDetails();
    this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
    this.getTimeSheetEntriesbyEmployeeId(this.employeeId,this.formattedweakendStart,undefined,undefined);
  }

  get projects(): FormArray {
    return this.timesheetForm.get('projects') as FormArray<FormGroup>;
  }

  secondsToHHMM(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
  lockextendMessage:string | null = null;

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
      description: [{ value: isNotEntered ? null : day?.description || null, disabled: !shouldEnable },[Validators.required]],
      approvalStatus: [{ value: day?.approvalStatus || null, disabled: !shouldEnable }],
      isBillable: [{ value: day?.isBillable || false, disabled: !billablecheck }],
      isLeave: [{ value: day?.isLeave || false, disabled: true }],
      isBlocked: [{ value: day?.isBlocked || false, disabled: true }],
      rejectReason: [day?.rejectReason || ''],
      blockReason: [blockReason],
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
        targetEmployeeId,
        isReportee
      );
    } else {
      // Fallback: load logged-in user’s data
      this.getTimeSheetEntriesbyEmployeeId(this.employeeId, formattedStart);
    }
  }

  // --- Add new project row ---
  addProject(project?: any, isProjectSelected: boolean = false) {
    const days = project?.days || [];
    // Patch "No Client / No Project" info
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
    // Create the project FormGroup
    const projectForm = this.fb.group({
      projectId: [project?.projectId || null],
      projectName: [project?.projectName || ''],
      clientId: [project?.clientId || null],
      clientName: [project?.clientName || null],
      phaseId: [project?.phaseId || null],
      phaseName: [project?.phaseName || null],
      selectedProject: [selectedProject],
      isNoClientProject: [!!project?.isNoClientProject],
      searchTerm: [''],
      mon: this.createDayEntry(days[0] || {}, this.weekDates[0], isProjectSelected,),
      tue: this.createDayEntry(days[1] || {}, this.weekDates[1], isProjectSelected,),
      wed: this.createDayEntry(days[2] || {}, this.weekDates[2], isProjectSelected,),
      thu: this.createDayEntry(days[3] || {}, this.weekDates[3], isProjectSelected,),
      fri: this.createDayEntry(days[4] || {}, this.weekDates[4], isProjectSelected,),
      sat: this.createDayEntry(days[5] || {}, this.weekDates[5], isProjectSelected,),
      sun: this.createDayEntry(days[6] || {}, this.weekDates[6], isProjectSelected,),
    });
    const newIndex = this.projects.length;
    this.projects.push(projectForm);
    this.showDots[newIndex] = {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    };
  }

  isReportee = false;
  onCheckemployee(employeed: any, dropdownType?: string) {
    this.employeeSelected = !!employeed;
    const formattedStart = moment(this.start).format('YYYY-MM-DD');
    if (employeed && dropdownType === 'team') {
      this.employeeId = employeed.id;
      this.isReportee = employeed.isReportee;
      this.selectedResource = employeed;
      this.getTimeSheetEntriesbyEmployeeId(this.empdata.employeeId, formattedStart, this.employeeId, this.isReportee);
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
      this.getTimeSheetEntriesbyEmployeeId(this.employeeId, formattedStart, undefined, undefined);
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
    this.getTimeSheetEntriesbyEmployeeId(this.employeeId, formattedStart, undefined, undefined);
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
    const project = this.timesheetdata?.projects?.[projectIndex];
    if (!project || !project.days) return [];
    return project.days.filter((day: any) => (day.approvalStatus?.toLowerCase() === 'draft' || day.approvalStatus?.toLowerCase() === 'not entered') 
    && !!day.entryId).map((day: any) => day.entryId);
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
  getTimeSheetEntriesbyEmployeeId(employeeId: number, start: any, targetEmployeeId?: number, isReportee?: boolean) {
    this.loading = true;
    // Build query params dynamically
    let query = `weekStartDate=${start}`;
    if (targetEmployeeId) {
      query += `&targetEmployeeId=${targetEmployeeId}`;
    }
    if (isReportee !== undefined) {
      query += `&isReportee=${isReportee}`;
    }
    this.http.getData(`Timesheet/week/employee/${employeeId}?${query}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        const data = res.data;
        this.timesheetdata = res.data;
        this.totalDuration = this.secondsToHHMM(
          data.totalDurationSeconds || 0
        );
        // Store start & end globally so state is preserved
        this.start = new Date(data.weekStartDate);
        this.end = new Date(data.weekEndDate);
        this.weekStartDate = new Date(data.weekStartDate);
        this.weekEndDate = new Date(data.weekEndDate);
        // Generate week dates array (Mon-Sun)
        this.weekDates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(this.weekStartDate!);
          date.setDate(date.getDate() + i);
          this.weekDates.push(date);
        }
        this.timesheetForm.reset();
        this.projects.clear();
        // Populate availableProjects dropdown
        this.noclientproject =
          data.projects?.some((p: any) => p.isNoClientProject) ?? false;
        this.availableProjects = data.projects || [];
        if (data.projects && data.projects.length > 0) {
          // Check if this is a project with actual project data or just empty template
          data.projects.forEach((p: any) => {
            const isNoClientProject = p.isNoClientProject ?? false;
            const hasProjectData = p.projectId && p.projectName;
            // If it has project data, treat it as a selected project
            const isProjectSelected = hasProjectData || isNoClientProject;
            this.addProject(p, isProjectSelected);
            this.getResourceData();
          });
        } else {
          // No projects at all, add blank row
          this.addProject();
        }
      },
      error: (err) => {
        this.loading = false;
      },
    });
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
          }
          if (!existingClient) {
            // Create new client
            existingClient = {
              clientId: clientId,
              clientName: curr?.client?.clientName || 'No Client',
              projects: [],
              shift: curr?.shift,
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
    let totalMinutes = 0;
    this.projects.controls.forEach((project) => {
      const dayControl = project.get(day);
      const duration = dayControl?.get('duration')?.value;
      const entryId = dayControl?.get('entryId')?.value;
      // Only count saved entries (with entryId)
      if (duration && entryId) {
        const [hh, mm] = duration.split(':').map(Number);
        totalMinutes += hh * 60 + (mm || 0);
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
  formatTime(event: any, dayName: string, rowIndex: number, duration: string,dayFormNew: AbstractControl | null) {
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
      if (approvalStatus !== 'Processed' && approvalStatus !== 'Waiting for Approval') {
        // Add small delay to prevent rapid successive calls
        const timeout = setTimeout(() => {
          this.openModal(this.addtask,dayFormNew,rowIndex,dayName);
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
    // Check if it's a holiday or leave from existing data first
    const existingDayData = this.availableProjects[0]?.days?.find((day: any) => {
      const dayDate = new Date(day.entryDate);
      return dayDate.toDateString() === date.toDateString();
    });
    // If existing data has blockReason as 'Weekend', use it
    if (existingDayData?.blockReason === 'Weekend') {
      return {
        isBlocked: true,
        blockReason: 'Weekend',
        isLeave: existingDayData?.isLeave || false
      };
    }
    // Otherwise return existing data or default values
    return {
      isBlocked: existingDayData?.isBlocked || false,
      blockReason: existingDayData?.blockReason || '',
      isLeave: existingDayData?.isLeave || false
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
  selectProjectForRow(row: AbstractControl, client: any, project: any, phase: any = null) {
    this.selectedProjectResource = null;
    const form = row as FormGroup;
    // Extract previous values (if user is switching projects)
    const prevClientId = form.get('clientId')?.value;
    const prevProjectId = form.get('projectId')?.value;
    const prevPhaseId = form.get('phaseId')?.value;
    // Patch selected project details into the form
    form.patchValue({
      clientId: client.clientId,
      projectId: project.projectId,
      clientName: client.clientName,
      projectName: project.projectName,
      phaseId: phase ? phase.phaseId : null,
      phaseName: phase ? phase.phaseName : null,
      selectedProject: {
        clientId: client.clientId,
        clientName: client.clientName,
        projectId: project.projectId,
        projectName: project.projectName,
        phaseId: phase ? phase.phaseId : null,
        phaseName: phase ? phase.phaseName : null
      },
    });
    // Skip redundant selection
    if (prevClientId === client?.clientId && prevProjectId === project?.projectId && prevPhaseId === (phase ? phase.phaseId : null)) {
      console.log('Same project/client selected — no update needed.');
      return;
    }
    // Update selectedPhaseIds safely (mutate instead of reassign)
    const idToAdd = phase ? phase.phaseId : project.projectId;
    const existingIndex = this.selectedPhaseIds.indexOf(idToAdd);
    if (existingIndex === -1) {
      this.selectedPhaseIds.push(idToAdd);
    }
    // Find selected resource
    const selectedResource = this.resourcesArrayList.find(
      (res: any) =>
        res.project?.projectId === project.projectId &&
        res?.phase?.phaseId === (phase ? phase.phaseId : null) &&
        res.client?.clientId === client.clientId
    );
    if (selectedResource) {
      this.selectedProjectResource = selectedResource;
    }
    // Prepare payload for API
    this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
    const billableCheck = selectedResource?.billable || false;
    const payload: any = {
      employeeId: this.empdata?.employeeId,
      weekStartDate: this.formattedweakendStart,
      isBillable: billableCheck,
      previousProjectId: prevProjectId || null,
      previousClientId: prevClientId || null,
      previousPhaseId: prevPhaseId || null
    };
    // Add IDs conditionally
    if (phase?.phaseId && phase.phaseId !== 0) payload.phaseId = phase.phaseId;
    if (project?.projectId && project.projectId !== 0) payload.projectId = project.projectId;
    if (client?.clientId && client.clientId !== 0) payload.clientId = client.clientId;
    // API call
    this.http.postdata('Timesheet/select-project', payload).subscribe({
      next: (res) => {
        this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
      },
      error: (err) => console.error('Error saving project state:', err)
    });
    // Update local selections
    this.selectedclientid = client.clientId;
    this.selectedprojectid = project.projectId;
    this.selectedProjectName = project.projectName;
    this.selectedClientname = client.clientName;
    this.selectedShiftDetails = client.shift;
    this.selectedPhaseId = phase ? phase.phaseId : null;
    this.selectedPhaseName = phase ? phase.phaseName : null;
    // Update day controls
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach((dayKey, index) => {
      const dayForm = form.get(dayKey) as FormGroup;
      const entryDate = this.weekDates[index];
      const dayStatus = this.getDayStatus(entryDate);
      let { isBlocked, blockReason, isLeave } = dayStatus;
      const isPhaseValid = this.isDateValidForPhase(entryDate, this.selectedProjectResource);
      if (!isPhaseValid && this.selectedProjectResource?.phase) {
        isBlocked = true;
        blockReason = 'Phase Date Restriction';
      }
      dayForm.patchValue({ isBlocked, blockReason, isLeave });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isFutureDate = entryDate > today;
      let isEffective = true;
      if (this.selectedProjectResource && this.selectedProjectResource.project?.projectId !== 0) {
        if (this.selectedProjectResource.startDate) {
          const start = new Date(this.selectedProjectResource.startDate);
          start.setHours(0, 0, 0, 0);
          isEffective = isEffective && entryDate >= start;
        }
        if (this.selectedProjectResource.endDate) {
          const end = new Date(this.selectedProjectResource.endDate);
          end.setHours(0, 0, 0, 0);
          isEffective = isEffective && entryDate <= end;
        }
        if (this.selectedProjectResource.phase) {
          const phaseStart = this.selectedProjectResource.phase.startDate ? new Date(this.selectedProjectResource.phase.startDate) : null;
          const phaseEnd = this.selectedProjectResource.phase.endDate ? new Date(this.selectedProjectResource.phase.endDate) : null;
          if (phaseStart) {
            phaseStart.setHours(0, 0, 0, 0);
            isEffective = isEffective && entryDate >= phaseStart;
          }
          if (phaseEnd) {
            phaseEnd.setHours(0, 0, 0, 0);
            isEffective = isEffective && entryDate <= phaseEnd;
          }
        }
      }
      const shouldEnable = !isLeave && !isFutureDate && isEffective &&
        (!isBlocked || (blockReason === 'Weekend' && this.selectedProjectResource?.weekendWorkAllowed));
      ['duration', 'description', 'startTime', 'endTime'].forEach((ctrl) => {
        if (shouldEnable) {
          dayForm.get(ctrl)?.enable();
        } else {
          dayForm.get(ctrl)?.disable();
        }
      });
      if (billableCheck) {
        dayForm.get('isBillable')?.enable();
      } else {
        dayForm.get('isBillable')?.disable();
      }
    });
    // Close dropdown
    const dropdownMenu = document.querySelector('.dropdown-menu.show');
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    const dropdownBtn = document.getElementById('dropdownMenuButton');
    if (dropdownBtn) {
      dropdownBtn.classList.remove('show');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
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

  showProjectsLength(projects: any[], selectedPhaseIds: any[]): number {
    return projects.filter((p) => {
      if (p.phases && p.phases.length > 0) {
        return p.phases.some((ph: any) => !selectedPhaseIds.includes(ph.phaseId));
      }
      return !selectedPhaseIds.includes(p.projectId);
    }).length;
  }

  hasAnyDuration(project: AbstractControl): boolean {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return days.some(day => project.get(day)?.get('duration')?.value && project.get(day)?.get('approvalStatus')?.value.toLowerCase() !== 'not entered');
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
      this.isModalOpen = true;
      const modalRef = this.modalService.open(content, { centered: true, backdrop: 'static' });
      // Reset flag when modal is closed
      modalRef.result.finally(() => {
        this.isModalOpen = false;
      });
      this.dayForm = dayForm; // keep reference
      const selectedResource = this.resourcesArrayList.find(
        (res: any) => res.project?.projectId === this.dayForm.get('projectId')?.value &&
          res.client?.clientId === this.dayForm.get('clientId')?.value && res.phase?.phaseId === this.dayForm.get('phaseId')?.value
      );
      if ((this.dayForm.get('approvalStatus')?.value === 'Processed' || this.dayForm.get('approvalStatus')?.value === 'Waiting for Approval') || this.employeeSelected) {
        this.dayForm.disable();
      } else {
        const billablecheck = !!(selectedResource?.billable || this.selectedProjectResource?.billable);
        this.dayForm.enable();
        if (!billablecheck) {
          this.dayForm.get('isBillable')?.disable();
        }
      }
      const approvalStatus = this.dayForm.get('approvalStatus')?.value;
      if (approvalStatus === 'Not Entered' || approvalStatus === '' || approvalStatus === null || approvalStatus === undefined) {
        this.dayForm.patchValue({
          isBillable: this.selectedProjectResource?.billable ?? selectedResource?.billable
        })
      }
      const shiftData = this.resourcesArrayList.find(
        (ele: any) => ele?.entityRefId === this.dayForm.get('projectId')?.value 
      );
      if ((this.selectedShiftDetails == undefined || this.selectedShiftDetails == null) &&
        this.dayForm.get('projectId')?.value != null) {
        this.selectedShiftDetails = shiftData?.shift;
      }
      // const status = dayForm.get('approvalStatus')?.value;
      // if(index===0){
      //   console.log(index,'index value',this.selectedShiftDetails)
      //   console.log(dayForm.get('duration')?.value,'dayform duration value')
      //   const shiftStart = moment(this.selectedShiftDetails?.shiftStartTime,'HH:mm:ss');
      //   const duration = dayForm.get('duration')?.value; // e.g. "02:30"
      //   if (shiftStart.isValid() && duration) {
      //     const [hours, minutes] = duration.split(':').map(Number);
      //     const endtime = shiftStart.clone().add(hours, 'hours').add(minutes, 'minutes').format('HH:mm:ss');
      //     // Now you can use endTime as needed
      //     this.dayForm.patchValue({
      //     startTime:this.selectedShiftDetails?.shiftStartTime,
      //     endTime:endtime
      //     });
      // }
      // }
      // ---------------------------------------------------------------------
      //Auto Start Time and End Time Time entry population
      // let startTime: string;
      // let endTime: string;
      // const duration = dayForm.get('duration')?.value; // e.g. "02:30"
      // if (index === 0) {
      //   // For the first project, always use shift start time for any day
      //   startTime = this.selectedShiftDetails?.shiftStartTime;
      // } else {
      //   // Subsequent projects: use previous project's same day's endTime
      //   const prevDayForm = this.projects.at(index - 1).get(dayKey) as FormGroup;
      //   startTime = prevDayForm?.get('endTime')?.value || this.selectedShiftDetails?.shiftStartTime;
      // }
      // if (startTime && duration) {
      //   const [hours, minutes] = duration.split(':').map(Number);
      //   endTime = moment(startTime, 'HH:mm:ss')
      //     .add(hours, 'hours')
      //     .add(minutes, 'minutes')
      //     .format('HH:mm:ss');
      //   this.dayForm.patchValue({
      //     startTime: startTime,
      //     endTime: endTime,
      //   });
      // }
      // ------------------------------------------------------------------------
      //-------------------------------------------------------
      //bidirectional logic for start time and end time
      // let startTime: string;
      // let endTime: string;
      // const duration = dayForm.get('duration')?.value; // e.g. "02:30"
      // // Check if previous project's same day's endTime exists
      // const prevDayForm =
      //   index > 0
      //     ? (this.projects.at(index - 1).get(dayKey) as FormGroup)
      //     : null;
      // const prevEndTime = prevDayForm?.get('endTime')?.value;
      // // Check if next project's same day's endTime exists
      // const nextDayForm =
      //   index < this.projects.length - 1
      //     ? (this.projects.at(index + 1).get(dayKey) as FormGroup)
      //     : null;
      // const nextEndTime = nextDayForm?.get('endTime')?.value;
      // // Determine startTime
      // if (prevEndTime) {
      //   // If previous project's endTime exists, use it
      //   startTime = prevEndTime;
      // } else if (nextEndTime) {
      //   // If next project's endTime exists, use it for current project's startTime
      //   startTime = nextEndTime;
      // } else {
      //   // Otherwise, use shift start time
      //   startTime = this.selectedShiftDetails?.shiftStartTime;
      // }
      // if (startTime && duration) {
      //   const [hours, minutes] = duration.split(':').map(Number);
      //   endTime = moment(startTime, 'HH:mm:ss')
      //     .add(hours, 'hours')
      //     .add(minutes, 'minutes')
      //     .format('HH:mm:ss');
      //   this.dayForm.patchValue({
      //     startTime: startTime,
      //     endTime: endTime,
      //   });
      // }
      //============================================================
      //helper method for start time and end time
      // this.recalculateTimes(dayKey, index);
      //-------------------------------------------------------
      // enable/disable based on status
      // if (status === 'draft' || status === 'Rejected' || status === 'Not Entered' || status === '') {
      //   this.dayForm.enable({ emitEvent: false }); // allow editing
      // } else {
      //   this.dayForm.disable({ emitEvent: false }); // make read-only
      // }
    }
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
    const formValue = this.dayForm.value;
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
      clientId: formValue.clientId || this.selectedclientid || null,
      projectId: formValue.projectId || this.selectedprojectid || null,
      phaseId: formValue.phaseId || this.selectedPhaseId || null,
      timesheetId: this.timesheetdata?.timesheetId || 0,
      isOverride: formValue.isBlocked || false,
      totalDurationSeconds: this.hhmmToSeconds(formValue.duration) || 0,
      isBillable: formValue.isBillable || false,
       moduleId: 30,
    };
    // POST request
    this.http.postdata('Timesheet/save-or-update', payload).subscribe({
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
        this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
        this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(err.error.message);
        console.error('Error saving entry', err);
        this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
        this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
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
    this.timesheetForm.reset()
    this.modalService.dismissAll();
    this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
    this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
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
      next: (res) => {
        this.spinnerLoaderforallrecoders = false
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Timesheet submitted successfully');
        this.selectedclientid = null;
        this.selectedprojectid = null;
        this.selectedProjectName = null;
        this.selectedClientname = null;
        this.selectedPhaseId = null;
        this.selectedPhaseName = null;
        this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
        this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
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
    this.router.navigate(
      ['project-management/timesheet/mysummary'],
      { queryParams: { id: this.loggedinuser?.employeeId } }
    );
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
    const { description, duration,  } = form.value;
    return !!(description && duration );
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.http.clearRequestclienttimesheet();
  }
}