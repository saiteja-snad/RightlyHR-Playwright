import { Component, OnInit } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule, NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { AccordionModule } from 'primeng/accordion';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { TimesheetResponse } from '../../../timesheetmodel';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
@Component({
  selector: 'app-time-sheet-view',
  imports: [ProjectManagementModuleInfoComponent, NgbDatepickerModule, FormsModule, ReactiveFormsModule, NgbPopover,
    CommonModule, DatePicker, DateformatPipe, AccordionModule, InfoIconComponent, ConfirmationIconComponent],
  templateUrl: './time-sheet-view.component.html',
  styleUrl: './time-sheet-view.component.scss'
})

export class TimeSheetViewComponent implements OnInit {
  timesheetForm!: FormGroup;
  dayForm!: FormGroup;
  jobdetails: any
  weekStartDate: Date | null = null;
  weekEndDate: Date | null = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  weekDates: Date[] = []; // 
  employeeId: any
  subscription!: Subscription;
  showDots: { [rowIndex: number]: { [day: string]: boolean } } = {};
  date!: Date[];
  selectedentryid: any;
  displayLabel = 'Please Select Date';
  formattedweakendStart: any;
  rowdelete: any;
  private start!: Date;
  private end!: Date;
  minDate!: Date;
  maxDate!: Date;
  maxMonth: Date = moment().add(1, 'months').endOf('month').toDate();
  selectedclientid: any
  selectedprojectid: any
  selectedProjectName: any
  selectedClientname: any
  selectedShiftDetails: any;
  clients: any[] = [];
  noclientproject = false
  availableProjects: any[] = []
  selectedProjectResource: any;
  timesheetdata!: TimesheetResponse
  resourcesArrayList: any[] = [];
  totalDuration: any;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService,
    public authService: AuthService, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    const loggedInUser = this.authService.getToken();
    this.employeeId = loggedInUser.employeeId;
    const startOfWeek = moment().startOf('isoWeek'); // Sunday by default (you can use .startOf('isoWeek') for Monday)
    const endOfWeek = moment().endOf('isoWeek');
    this.setWeekRange(startOfWeek, endOfWeek);
    this.timesheetForm = this.fb.group({
      projects: this.fb.array([])
    });
    // Add one initial row
    // this.addProject();
    this.getJobDetails();
    this.formattedweakendStart = moment(this.start).format('YYYY-MM-DD');
    this.getTimeSheetEntriesbyEmployeeId(
      this.employeeId,
      this.formattedweakendStart
    );
  }

  get projects(): FormArray {
    return this.timesheetForm.get('projects') as FormArray<FormGroup>;
  }

  secondsToHHMM(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  createDayEntry(day?: any, entryDate?: any, isWeekendAllowedProject: boolean = false, isProjectSelected: boolean = false): FormGroup {
    const isNotEntered = day?.approvalStatus === 'Not Entered';
    const dateValue = day?.entryDate || entryDate;
    const entryDateObj = dateValue ? new Date(dateValue) : null;
    const blockReason = day?.blockReason || '';
    // Check if day is blocked
    const isBlocked = day?.isBlocked || false;
    const isLeave = day?.isLeave || false;
    // Enable weekends only if allowed, and only if not blocked
    const isWeekend = blockReason === 'Weekend';
    const shouldEnable = isProjectSelected && !isLeave && !isBlocked
      ? (isWeekend ? isWeekendAllowedProject : true)
      : false;
    const durationControl = this.fb.control(
      isNotEntered
        ? ''
        : (day?.durationSeconds != null ? this.secondsToHHMM(day.durationSeconds) : ''),
      Validators.required
    );
    // Initially disabled until project is selected or if blocked/leave
    if (!shouldEnable) {
      durationControl.disable({ emitEvent: false });
    }
    return this.fb.group({
      entryId: [{ value: day?.entryId || null, disabled: !shouldEnable }],
      approverId: [{ value: day?.approverId || null, disabled: !shouldEnable }],
      clientName: [{ value: day?.clientName || '', disabled: !shouldEnable }],
      clientId: [{ value: day?.clientId || null, disabled: !shouldEnable }],
      projectId: [{ value: day?.projectId || null, disabled: !shouldEnable }],
      projectName: [{ value: day?.projectName || '', disabled: !shouldEnable }],
      entryDate: [{ value: dateValue || '', disabled: !shouldEnable }],
      startTime: [
        { value: isNotEntered ? '' : (day?.startTime || ''), disabled: !shouldEnable },
        Validators.required
      ],
      endTime: [
        { value: isNotEntered ? '' : (day?.endTime || ''), disabled: !shouldEnable },
        Validators.required
      ],
      duration: durationControl,
      description: [{ value: isNotEntered ? '' : (day?.description || ''), disabled: !shouldEnable }, Validators.required],
      approvalStatus: [{ value: day?.approvalStatus || '', disabled: !shouldEnable }],
      isLeave: [{ value: day?.isLeave || false, disabled: true }],
      isBlocked: [{ value: day?.isBlocked || false, disabled: true }],
      rejectReason: [day?.rejectReason || ''],
      blockReason: [day?.blockReason || '']
    });
  }

  // --- Add new project row ---
  addProject(project?: any, isProjectSelected: boolean = false) {
    const days = project?.days || [];
    // If not explicitly passed, determine based on project data
    if (!isProjectSelected && project) {
      const hasProjectData = project.projectId && project.projectName;
      // const hasTimeEntries = days.some((day: any) => day.entryId || day.durationSeconds > 0 || day.startTime);
      isProjectSelected = hasProjectData;
    }
    const isWeekendAllowedProject = project?.isWeekendAllowedProject ?? false;
    // If the project has "no client / no project", patch it here
    let selectedProject = null;
    if (project?.isNoClientProject) {
      selectedProject = {
        clientId: null,
        clientName: 'No Client',
        projectId: null,
        projectName: 'No Project'
      };
    } else if (project && project.projectId) {
      selectedProject = {
        clientId: project.clientId,
        clientName: project.clientName ?? '',
        projectId: project.projectId,
        projectName: project.projectName ?? ''
      };
    }
    const projectForm = this.fb.group({
      projectId: [project?.projectId || null],
      projectName: [project?.projectName || ''],
      clientId: [project?.clientId || null],
      clientName: [project?.clientName || null],
      selectedProject: [selectedProject],
      isNoClientProject: [!!project?.isNoClientProject],
      searchTerm: [''],
      // Create day entries for Mon-Sun
      mon: this.createDayEntry(days[0] || {}, this.weekDates[0], isWeekendAllowedProject, isProjectSelected),
      tue: this.createDayEntry(days[1] || {}, this.weekDates[1], isWeekendAllowedProject, isProjectSelected),
      wed: this.createDayEntry(days[2] || {}, this.weekDates[2], isWeekendAllowedProject, isProjectSelected),
      thu: this.createDayEntry(days[3] || {}, this.weekDates[3], isWeekendAllowedProject, isProjectSelected),
      fri: this.createDayEntry(days[4] || {}, this.weekDates[4], isWeekendAllowedProject, isProjectSelected),
      sat: this.createDayEntry(days[5] || {}, this.weekDates[5], isWeekendAllowedProject, isProjectSelected),
      sun: this.createDayEntry(days[6] || {}, this.weekDates[6], isWeekendAllowedProject, isProjectSelected)
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
      sun: false
    };
  }

  getDraftEntryIdsByProject(projectIndex: number): number[] {
    const project = this.timesheetdata?.projects?.[projectIndex];
    if (!project || !project.days) return [];
    return project.days
      .filter((day: any) => day.approvalStatus?.toLowerCase() === 'draft' && !!day.entryId)
      .map((day: any) => day.entryId);
  }

  openModalfordeletealldata(content: any, index: number) {
    this.rowdelete = index
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  removeProject(index: number) {

    // Get all draft entry IDs for this project
    const draftEntryIds = this.getDraftEntryIdsByProject(index);
    if (draftEntryIds.length > 0) {
      const payload = {
        timesheetId: this.timesheetdata.timesheetId,
        entryIds: draftEntryIds
      };
      this.http.DeleteData('Timesheet/delete-entries', payload).subscribe({
        next: (res) => {
          this.modalService.dismissAll()
          this.conformationPopup.openSuccessModal('Draft entries deleted successfully');
          this.formattedweakendStart = moment(this.start).format("YYYY-MM-DD");
          this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
          // remove project from form array after successful delete
          this.projects.removeAt(index);
          if (this.projects.length === 0) {
            this.addProject();
          }
        },
        error: (err: any) => {
         this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to delete time entry');

        }
      });
    } else {
      // No draft entries → just remove project from UI
      this.projects.removeAt(index);
      if (this.projects.length === 0) {
        this.addProject();
      }
      this.modalService.dismissAll()
      this.conformationPopup.openSuccessModal('Row deleted successfully');
    }
  }

  ///helper method to update week range
  setWeekRange(start: moment.Moment, end: moment.Moment) {
    this.start = start.toDate();
    this.end = end.toDate();
    this.date = [this.start, this.end];
    this.displayLabel = `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
    this.minDate = start.toDate();
    this.maxDate = end.toDate();
  }

  // previous week
  previousWeek() {
    if (this.start && this.end) {
      const prevStart = moment(this.start).subtract(7, 'days').startOf('day');
      const prevEnd = moment(this.end).subtract(7, 'days').endOf('day');
      this.start = prevStart.toDate();
      this.end = prevEnd.toDate();
      this.setWeekRange(prevStart, prevEnd);
      const formattedStart = moment(prevStart).format('YYYY-MM-DD');
      this.getTimeSheetEntriesbyEmployeeId(
        this.employeeId,
        formattedStart
      );
    }

  }

  // next week
  nextWeek() {
    if (this.start && this.end) {
      const nextStart = moment(this.start).add(7, 'days').startOf('day');
      const nextEnd = moment(this.end).add(7, 'days').endOf('day');
      this.start = nextStart.toDate();
      this.end = nextEnd.toDate();
      this.setWeekRange(nextStart, nextEnd);
      const formattedStart = moment(nextStart).format('YYYY-MM-DD');
      this.getTimeSheetEntriesbyEmployeeId(
        this.employeeId,
        formattedStart
      );
    }
  }

  //GET DATA to show in table
  getTimeSheetEntriesbyEmployeeId(employeeId: number, start: any) {
    this.http.getData(`Timesheet/week/employee/${employeeId}?weekStartDate=${start}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.timesheetdata = res.data;
        this.totalDuration = this.secondsToHHMM(data.totalDurationSeconds || 0);
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
        this.noclientproject = data.projects?.some((p: any) => p.isNoClientProject) ?? false;
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
      }
    });
  }

  //GET CLIENT AND PROJECT
  getResourceData() {
    this.http.getDataIncludeParams(`ProjectResource?status=Active&employeeId=${this.employeeId}&isProjectRequired=true`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.success) {
          this.resourcesArrayList = res.data;
          const rawData = res.data;
          this.clients = rawData.reduce((acc: any[], curr: any) => {
            let existingClient = acc.find(c => c.clientId === curr.client.clientId);
            const projectObj = {
              projectId: curr?.project?.projectId,
              projectName: curr?.project?.projectName,
              startDate: curr?.startDate,
              endDate: curr?.endDate,
              status: curr?.status,
              role: curr?.role,
              isWeekendAllowed: curr?.project?.isWeekendAllowed || curr?.client?.isWeekendAllowed,
              isOverTimeAllowed: curr?.project?.isOverTimeAllowed || curr?.client?.isOverTimeAllowed,
              isBillable: curr?.project?.isbillable || curr?.client?.isbillable
            };

            if (existingClient) {
              existingClient.projects.push(projectObj);
            } else {
              acc.push({
                clientId: curr?.client?.clientId,
                clientName: curr?.client?.clientName,
                projects: [projectObj],
                shift: curr?.shift
              });
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
                  startDate: null,
                  endDate: null,
                  status: null,
                  role: null,
                  isWeekendAllowed: false,
                  isOverTimeAllowed: false,
                  isBillable: false,
                  isNoClientProject: true
                }
              ]
            });
          }
        }
      });
  }


  // Calculate total hours across all projects (weekly total)
  getTotalHoursAllProjects(): string {
    let totalMinutes = 0;
    this.projects.controls.forEach(project => {
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      days.forEach(day => {
        const duration = project.get([day, 'duration'])?.value;
        if (duration) {
          const [hh, mm] = duration.split(':').map(Number);
          totalMinutes += (hh * 60) + (mm || 0);
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
    this.projects.controls.forEach(project => {
      const duration = project.get([day, 'duration'])?.value;
      if (duration) {
        const [hh, mm] = duration.split(':').map(Number);
        totalMinutes += (hh * 60) + (mm || 0);
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getJobDetails() {
    let EmployeeId = parseInt(this.employeeId);
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobdetails = data[0];
      },
      error: (data: any) => {
        console.log(data)
      }
    });
  }
  // Check if daily total exceeds 8 hours
  isDayExceeded(day: string): boolean {
    let totalMinutes = 0;
    this.projects.controls.forEach(project => {
      const duration = project.get([day, 'duration'])?.value;
      if (duration) {
        const [hh, mm] = duration.split(':').map(Number);
        totalMinutes += (hh * 60) + (mm || 0);
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


  //TIME ENTERIY
 formatTime(event: any, dayName: string, rowIndex: number, duration: string) {
  let value = event.target.value;
  value = value?.replace(/\D/g, ''); // digits only
  let formatted = '';

  let today = new Date().toDateString();  
  let inputDay = new Date(dayName).toDateString(); // make sure dayName is a valid date string

  const isToday = today === inputDay;

  if (value?.length === 4) {
    let hours = parseInt(value.slice(0, 2), 10);
    let minutes = parseInt(value.slice(2), 10);

    if (hours >= 70 && value?.endsWith("00")) {
      hours = parseInt(value.slice(0, 1), 10);
      minutes = 0;
    }

    // ✅ Today can allow 24:00, otherwise max 23:59
    if (isToday) {
      if (hours > 24) hours = 24;
      if (minutes > 59) minutes = 59;
      if (hours === 24) minutes = 0;
    } else {
      if (hours > 23) hours = 23;
      if (minutes > 59) minutes = 59;
    }

    formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } 
  else if (value?.length === 3) {
    let hours = parseInt(value[0], 10);
    let minutes = parseInt(value?.slice(1), 10);

    if (isToday) {
      if (hours > 24) hours = 24;
      if (minutes > 59) minutes = 59;
      if (hours === 24) minutes = 0;
    } else {
      if (hours > 23) hours = 23;
      if (minutes > 59) minutes = 59;
    }

    formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } 
  else if (value?.length <= 2 && value?.length > 0) {
    let hours = parseInt(value, 10);
    if (isToday) {
      if (hours > 24) hours = 24;
      if (hours === 24) formatted = "24:00";
      else formatted = `${hours.toString().padStart(2, '0')}:00`;
    } else {
      if (hours > 23) hours = 23;
      formatted = `${hours.toString().padStart(2, '0')}:00`;
    }
  } 
  else {
    formatted = '';
  }

  const control = this.projects.at(rowIndex).get(`${dayName}.${duration}`);
  if (control) {
    control.setValue(formatted, { emitEvent: false });
  }

  this.showDots[rowIndex][dayName] = true;
}


  //DELETE RECODER
  opendeleteModal(content: any, data: AbstractControl) {
    this.selectedentryid = data;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  //single entry delete
  deletesingleentry() {
    const payload = {
      timesheetId: this.timesheetdata.timesheetId,
      entryIds: [this.selectedentryid]
    };
    this.http.DeleteData('Timesheet/delete-entries', payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Time Entry is deleted successfully');
        this.selectedentryid = null;
        this.formattedweakendStart = moment(this.start).format("YYYY-MM-DD");
        this.getTimeSheetEntriesbyEmployeeId(
          this.employeeId,
          this.formattedweakendStart
        );
      },
      error: (err: any) => {
        console.error('Delete failed', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to delete time entry');
      }
    });
  }

  // dropdown filter
  getFilteredClientsForRow(project: AbstractControl): any[] {
    const term = (project.get('searchTerm')?.value || '').trim().toLowerCase();
    if (!term) return this.clients;
    return this.clients
      .map(client => {
        if (client.clientName.toLowerCase().includes(term)) {
          return client;
        }
        const filteredProjects = client.projects.filter(
          (p: any) => p.projectName.toLowerCase().includes(term)
        );
        if (filteredProjects.length > 0) {
          return { ...client, projects: filteredProjects }; // fallback only when filtering
        }
        return null;
      })
      .filter((c: any) => c && c.projects.length > 0);
  }

  selectedProject: { clientName: string, projectName: string } | null = null;
  selectProjectForRow(row: AbstractControl, client: any, project: any) {
    console.log(client, project);

    const form = row as FormGroup;
    // Patch project details
    form.patchValue({
      clientId: client.clientId,
      projectId: project.projectId,
      clientName: client.clientName,
      projectName: project.projectName,
      selectedProject: {
        clientId: client.clientId,
        clientName: client.clientName,
        projectId: project.projectId,
        projectName: project.projectName,
      },
    });
    const selectedResource = this.resourcesArrayList.find(
      (res: any) => res.project?.projectId === project.projectId && res.client?.clientId === client.clientId
    );

    if (selectedResource) {
      console.log("Full project object:", selectedResource.weekendWorkAllowed);
      // Example: store it in a weekendWorkAllowed for form binding
      this.selectedProjectResource = selectedResource;
    }
    this.selectedclientid = client.clientId;
    this.selectedprojectid = project.projectId;
    this.selectedProjectName = project.projectName;
    this.selectedClientname = client.clientName;
    this.selectedShiftDetails = client.shift;
    // Days array
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach(dayKey => {
      const dayForm = form.get(dayKey) as FormGroup;
      if (!dayForm) return;
      const isBlocked = dayForm.get('isBlocked')?.value;
      const blockReason = dayForm.get('blockReason')?.value;
      const isLeave = dayForm.get('isLeave')?.value;
      // Enable basic fields if not blocked or leave
      ['clientName', 'clientId', 'projectName', 'projectId', 'startTime', 'endTime', 'description'].forEach(ctrl => {
        if (!isBlocked && !isLeave) {
          dayForm.get(ctrl)?.enable();
        } else {
          dayForm.get(ctrl)?.disable();
        }
      });
      // Enable duration
      if (!isBlocked && !isLeave) {
        dayForm.get('duration')?.enable();
      } else if (blockReason === 'Weekend' && this.selectedProjectResource?.weekendWorkAllowed) {
        // If weekend is blocked but project allows weekends
        dayForm.get('duration')?.enable();
      } else {
        dayForm.get('duration')?.disable();
      }
    });
    // Close dropdown safely
    const dropdownMenu = document.querySelector('.dropdown-menu.show');
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    const dropdownBtn = document.getElementById('dropdownMenuButton');
    if (dropdownBtn) {
      dropdownBtn.classList.remove('show');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // Check if any projects under this client are unselected
  hasUnselectedProjects(client: any): boolean {
    return client.projects.some((p: any) => {
      const isNoClientProject = client.clientId === 0 && p.projectId === 0;

      if (isNoClientProject) {
        return !this.selectedProjectIds.includes(0); // check against 0
      }
      return !this.selectedProjectIds.includes(p.projectId);
    });
  }
  
  showprojectlength(projects: any[], selectedProjectIds: any[]): number {
  return projects.filter(p => !selectedProjectIds.includes(p.projectId)).length;
}

  // Get all selected project IDs across all rows
  get selectedProjectIds(): any[] {
    return this.projects.controls
      .map((ctrl: AbstractControl) => ctrl.value?.projectId)
      .filter(id => id !== undefined && id !== null); // 0 will be kept
  }

  //OPEN TIME ENTERIY
  openModal(content: any, dayForm: AbstractControl | null, index: number, dayKey: string) {
    if (dayForm instanceof FormGroup) {
      this.modalService.open(content, { centered: true, backdrop: 'static' });
      this.dayForm = dayForm; // keep reference
      const shiftData = this.resourcesArrayList.find((ele: any) => ele?.entityRefId === this.dayForm.get('projectId')?.value);
      if ((this.selectedShiftDetails == undefined || this.selectedShiftDetails == null) && this.dayForm.get('projectId')?.value != null) {
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
      let startTime: string;
      let endTime: string;
      const duration = dayForm.get('duration')?.value; // e.g. "02:30"

      // Check if previous project's same day's endTime exists
      const prevDayForm =
        index > 0
          ? (this.projects.at(index - 1).get(dayKey) as FormGroup)
          : null;
      const prevEndTime = prevDayForm?.get('endTime')?.value;

      // Check if next project's same day's endTime exists
      const nextDayForm =
        index < this.projects.length - 1
          ? (this.projects.at(index + 1).get(dayKey) as FormGroup)
          : null;
      const nextEndTime = nextDayForm?.get('endTime')?.value;

      // Determine startTime
      if (prevEndTime) {
        // If previous project's endTime exists, use it
        startTime = prevEndTime;
      } else if (nextEndTime) {
        // If next project's endTime exists, use it for current project's startTime
        startTime = nextEndTime;
      } else {
        // Otherwise, use shift start time
        startTime = this.selectedShiftDetails?.shiftStartTime;
      }

      if (startTime && duration) {
        const [hours, minutes] = duration.split(':').map(Number);
        endTime = moment(startTime, 'HH:mm:ss')
          .add(hours, 'hours')
          .add(minutes, 'minutes')
          .format('HH:mm:ss');
        this.dayForm.patchValue({
          startTime: startTime,
          endTime: endTime,
        });
      }
      //-------------------------------------------------------
      // enable/disable based on status
      // if (status === 'draft' || status === 'Rejected' || status === 'Not Entered' || status === '') {
      //   this.dayForm.enable({ emitEvent: false }); // allow editing
      // } else {
      //   this.dayForm.disable({ emitEvent: false }); // make read-only
      // }
    }
  }

  //single recoder
  saveDayEntry() {
    // Prepare payload
    const formValue = this.dayForm.value;
    const toTimeSpan = (time: string | null | undefined): string => {
      if (!time) return "00:00:00";
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
      return "00:00:00";
    };

    const payload = {
      entryId: formValue.entryId || 0,
      employeeId: this.employeeId || 0,
      entryDate: moment(this.dayForm.get('entryDate')?.value).format("YYYY-MM-DD"),
      startTime: toTimeSpan(formValue.startTime) || "",
      endTime: toTimeSpan(formValue.endTime) || "",
      description: formValue.description || "",
      approvalStatus: 'draft',
      clientId: formValue.clientId || this.selectedclientid || null,
      projectId: formValue.projectId || this.selectedprojectid || null,
      timesheetId: this.timesheetdata?.timesheetId || 0,
      isOverride: formValue.isBlocked || false,
      totalDurationSeconds: this.hhmmToSeconds(formValue.duration) || 0
    };
    // POST request
    this.http.postdata('Timesheet/save-or-update', payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll()
        this.getResourceData();
        this.conformationPopup.openSuccessModal('Task added successfully');
        this.selectedclientid = null
        this.selectedprojectid = null
        this.selectedProjectName = null
        this.selectedClientname = null
        this.formattedweakendStart = moment(this.start).format("YYYY-MM-DD");
        this.getTimeSheetEntriesbyEmployeeId(this.employeeId, this.formattedweakendStart);
      },
      error: (err) => {
        this.conformationPopup.openErrorModal(err.error.message)
        console.error('Error saving entry', err);
      }
    });
  }

  // Helper: convert HH:MM to seconds
  hhmmToSeconds(hhmm: string): number {
    if (!hhmm) return 0;
    const [hours, minutes] = hhmm.split(':').map(Number);
    return (hours || 0) * 3600 + (minutes || 0) * 60;
  }

  openModalforconformation(content: any,) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.modalService.dismissAll();
    this.formattedweakendStart = moment(this.start).format("YYYY-MM-DD");
    this.getTimeSheetEntriesbyEmployeeId(
      this.employeeId,
      this.formattedweakendStart
    );
  }

  //payload for submit-for-approval
  buildPayload(): any {
    const formValue = this.timesheetForm.getRawValue(); // include disabled fields
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const entries = formValue.projects.flatMap((project: any) =>
      dayKeys.map((dayKey, idx) => {
        const day = project[dayKey];
        if (!day || !day.duration) return null;
        // ✅ Only include days with draft approvalStatus
        if (day.approvalStatus !== 'draft') return null;
        return {
          entryId: day.entryId || 0,
          approverId:day.approverId || 0,
          clientId: project.selectedProject?.clientId || 0,
          projectId: project.selectedProject?.projectId || 0,
          entryDate: moment(this.weekDates[idx]).format("YYYY-MM-DD"),
          durationSeconds: this.hhmmToSeconds(day.duration),
          description: day.description || '',
          isOverride: false,
          projectName: project.selectedProject?.projectName || '',
          clientName: project.selectedProject?.clientName || '',
          approvalStatus: day.approvalStatus // include approvalStatus
        };
      })
    ).filter((entry: any) => entry !== null);
    return {
      timesheetId: formValue.timesheetId || this.timesheetdata.timesheetId,
      weekStart: this.formattedweakendStart,
      employeeId: this.employeeId,
      entries
    };
  }

  // Call this on Submit button click
  submitTimesheet(): void {
    const payload = this.buildPayload();
    this.http.postdata('Timesheet/submit-for-approval', payload).subscribe({
      next: (res) => {
        this.conformationPopup.openSuccessModal('Timesheet submitted successfully');
        this.selectedclientid = null;
        this.selectedprojectid = null;
        this.selectedProjectName = null;
        this.selectedClientname = null;
        this.formattedweakendStart = moment(this.start).format("YYYY-MM-DD");
        this.getTimeSheetEntriesbyEmployeeId(
          this.employeeId,
          this.formattedweakendStart
        );
      },
      error: (err) => {
        console.error('Failed to submit timesheet', err);
        this.conformationPopup.openSuccessModal(err.error.message);
      }
    });
  }

  //hide delet button
  canDelete(project?: AbstractControl,index?: number): boolean {
    if (!project) return false;
    const projectId = project.get('projectId')?.value;
    const projectName = project.get('projectName')?.value;


    if (index === 0 && !projectId && !projectName) {
      return false;
    }
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return days.every(dayKey => {
      const dayControl = project.get(dayKey) as FormGroup;
      if (!dayControl) return true; // no day, consider deletable
      const approvalStatus = dayControl.get('approvalStatus')?.value;
      return !approvalStatus || approvalStatus === 'draft' || approvalStatus === 'Not Entered' || approvalStatus === null;
    });
  }

  //disable button for sumbit for approval
  isSubmitDisabled(): boolean {
    return this.projects.controls.every((project: AbstractControl) => {
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      // check if any day has draft status
      const hasDraft = days.some(day => project.get(day)?.value?.approvalStatus === 'draft');
      // disable only if all are blocked AND no draft exists
      return !hasDraft;
    });
  }

  // Check if any of the fields in the day form are filled
  isDayFormDirtyOrFilled(form: FormGroup): boolean {
    const { description, startTime, endTime, } = form.value;
    return !!(description && startTime && endTime);
  }

  //based status colour
  getApprovalClass(control: AbstractControl | null): any {
    const status = control?.value?.approvalStatus;
    return {
      'approved': status === 'Processed',
      'rejected': status === 'Rejected',
      'waiting': status === 'Waiting for Approval',
      'draft': status === 'draft'
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