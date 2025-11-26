import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TimesheetsTabsComponent } from "../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { TimeTrackingData } from '../../../Interfaces/team-summary-time-sheet.model';
import { IResourceDetail } from '../../../timesheetmodel';
import { NgbModal, NgbOffcanvas, NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { DatePicker } from 'primeng/datepicker';
import { HttpService } from '../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DailyData, MonthlySummaryItem, TimesheetEntry, TimesheetSummaryResponse } from '../../../Interfaces/timesheetsummary';
import { Subject } from 'rxjs/internal/Subject';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { ChartModule } from 'primeng/chart';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { ProgressBarModule } from 'primeng/progressbar';
import { ModuleInfoIconComponent } from "../../../icons/module-info-icon/module-info-icon.component";
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { Skeleton } from "primeng/skeleton";
import { TimesheetsResourceTabsComponent } from "../timesheets-resource-tabs/timesheets-resource-tabs.component";
import { MultiSelectModule } from 'primeng/multiselect';
import { EncriptdecriptService } from '../../../services/encriptdecript.service';
import { TimesheetFilterService } from '../../../services/timesheet-filter.service';
import { TimesheetSharedDataService } from '../../../services/timesheet-shared-data.service';
import { Chip } from 'primeng/chip';
@Component({
  selector: 'app-timesheets-summary-view',
  imports: [TimesheetsTabsComponent, ReactiveFormsModule, NgbPopover, DatePicker, ChartModule, TranslateModule, CommonModule, Select, NgbPopoverModule,
    NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent, InfoIconComponent, ProgressBarModule, ModuleInfoIconComponent,
    ModuleInformationComponent, Skeleton, TimesheetsResourceTabsComponent,MultiSelectModule,Chip],
  templateUrl: './timesheets-summary-view.component.html',
  styleUrl: './timesheets-summary-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class TimesheetsSummaryViewComponent implements OnInit,OnDestroy {
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  empdata = {} as any;
  teamSummaryData: TimeTrackingData[] = [];
  activeEmplist = [] as any;
  dateHeaders: string[] = [];
  subscription!: Subscription;
  ranges: any;
  datepickerForm!: FormGroup;
  totalhrs: any
  attendanceSummaryData: DailyData[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedEntries: TimesheetEntry[] = [];
  timesheetSummaryChartData: any;
  timesheetutilizeSummaryChartData: any;
  timesheetSummaryOptions: any;
  timesheetUtilizeSummaryOptions: any;
  statusCounts$ = new BehaviorSubject<MonthlySummaryItem[]>([]);
  utilizationcount$ = new BehaviorSubject<any>(null);
  totalEntries = 0;
  loading = false;
  resourcesList: IResourceDetail[] = [];
  // Project Type Data variables
  projectTypeLabelData: any;
  projectTypeData: any;
  projectTypeGraphData: any;
  employeeId: any
  projectTypeGraphOptions: any;
  // Estimated Vs ActualData variables
  estimatedVsActualData: any;
  estimatedVsActualGraphData: any;
  estimatedVsActualGraphOptions: any;
  employename: any
  // progress bar variables
  progressBarData: any;
  approved = 0;
  submitted = 0;
  rejected = 0;
  approvedColor = '#4CAF50';  // green
  submittedColor = '#FFC107'; // yellow
  rejectedColor = '#F44336';  // red
  rejectedPercent!: number;
  approvedPercent!: number;
  submittedPercent!: number;
  displayApproved!: string;
  displaySubmitted!: string;
  displayRejected!: string;
  ProjectwisehoursSummary = 'The Project-Wise hours summary widget represents a pie chart visualization of the hours logged across different assigned projects. It displays each project along with the total submitted hours, providing a clear graphical representation of effort distribution and helping managers analyse time allocation effectively. '
  AllocatedActualhours = 'The Allocated and Actual Hours widget provides a graphical representation comparing the total allocated hours against the actual hours logged. This visual summary helps employees and managers quickly assess utilization, identify variances, and ensure that project time allocations align with actual work efforts. '
  TimesheetSummary = 'The Timesheet Summary widget provides a visual representation of timesheet data through a line diagram. It consolidates the total hours that are approved, rejected, and waiting for approval, offering a quick and clear overview of timesheet trends and approval statuses over time.  '
  // content loaders variables
  tableLoader = false;
  allocatedVsActualLoader = false;
  projectwisehour = false;
  startDate: any;
  endDate: any;
  projectDetails=[] as any;
  clientDetails=[] as any;
  departmentDetails=[] as any;
  tmandRmDetails=[] as any;
  filterData={} as any;
  constructor(private fb: FormBuilder, private router: Router, private modalService: NgbModal, private http: HttpService,
    public rbac: RbacService, private route: ActivatedRoute,private encryptionService:EncriptdecriptService, private offcanvasService: NgbOffcanvas,
    private filterService: TimesheetFilterService, private sharedDataService: TimesheetSharedDataService) { }

  ngOnInit() {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getprojectData();
    this.getclientData();
    this.getdepartmentData();
    this.getTmandRMData();
    this.updateModuleInfo();
    this.createDatepickerForm();
    this.loadFiltersFromNavigation();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
    this.projectWiseChart();
    this.estimatedActualChart();
  }

  loadFiltersFromNavigation() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        const decrypted = this.encryptionService.decrypt(params['data']);
        const resoureID = Array.isArray(decrypted?.resourceId) ? decrypted.resourceId[0] : decrypted?.resourceId;
        this.filterData = {
          projectId: decrypted?.projectId || null,
          clientId: decrypted?.clientId || null,
          departmentId: decrypted?.departmentId || null,
          tmorrmId: decrypted?.tmorrmId || null,
          dateRange: decrypted?.dateRange || null
        };
        if (resoureID) {
          this.employeeId = parseInt(resoureID);
          this.setDefaultmounth();
          this.getProjectSummary(resoureID);
          this.getEmployeeId(resoureID);
        }
      } else {
        const savedFilters = this.filterService.getCurrentFilters();
        if (savedFilters) {
          this.datepickerForm.patchValue(savedFilters);
          if (savedFilters.resourceId) {
            this.employeeId = savedFilters.resourceId;
          }
        } else {
          this.setDefaultmounth();
        }
      }
    });
  }
//get all projects list
  getprojectData(): void {
    this.subscription = this.sharedDataService.getProjectData().subscribe({
      next: (res: any) => {
        this.projectDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
      }
    });
  }
  //get all clients list
  getclientData(): void {
    this.subscription = this.sharedDataService.getClientData().subscribe({
      next: (res: any) => {
        this.clientDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }
  //get all departments list
  getdepartmentData(): void {
    this.subscription = this.sharedDataService.getDepartmentData().subscribe({
      next: (res: any) => {
        this.departmentDetails = res;
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
      }
    });
  }

  //get all TM and RM list
  getTmandRMData(): void {
    this.subscription = this.sharedDataService.getTmandRMData().subscribe({
      next: (res: any) => {
        this.tmandRmDetails = this.sharedDataService.formatTmRmList(res);
      },
      error: (err) => {
        console.error('Error fetching TM/RM:', err);
      },
    });
  }

  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null, Validators.required],
      resourceId: [null], // Single select for summary screens
      projectId: [null],
      clientId: [null],
      departmentId: [null],
      tmorrmId: [null]
    });
  }

  onEmployeeChange() {
    // Do nothing - let user click Apply to refresh
    // This preserves behavior where changes only apply on Submit
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    // Check if any filter (except date & employee) has value
    return (
      (formValue?.projectId && formValue?.projectId?.length > 0) ||
      (formValue?.clientId && formValue?.clientId?.length > 0) ||
      (formValue?.departmentId && formValue?.departmentId?.length > 0) ||
      (formValue?.tmorrmId && formValue?.tmorrmId?.length > 0)
    );
  }

  resetForm() {
    this.datepickerForm.patchValue({
      projectId: null,
      clientId: null,
      departmentId: null,
      tmorrmId: null
    });
    this.filterService.clearOnlyFilterFields();
    this.getAllEmployeeDetails();
    this.getResourceDetailsByManagerId();
    this.closeCanvas();
  }

  getSelectedFilters(): any[] {
    const filters: any[] = [];
    const formValue = this.datepickerForm.value;

    if (formValue.projectId && formValue.projectId.length > 0) {
      formValue.projectId.forEach((id: any) => {
        const project = this.projectDetails.find((p: any) => p.projectId === id);
        if (project) {
          filters.push({ type: 'projectId', label: project.projectName, value: id });
        }
      });
    }

    if (formValue.clientId && formValue.clientId.length > 0) {
      formValue.clientId.forEach((id: any) => {
        const client = this.clientDetails.find((c: any) => c.clientId === id);
        if (client) {
          filters.push({ type: 'clientId', label: client.clientName, value: id });
        }
      });
    }

    if (formValue.departmentId && formValue.departmentId.length > 0) {
      formValue.departmentId.forEach((id: any) => {
        const dept = this.departmentDetails.find((d: any) => d.sno === id);
        if (dept) {
          filters.push({ type: 'departmentId', label: dept.departmentName, value: id });
        }
      });
    }

    if (formValue.tmorrmId && formValue.tmorrmId.length > 0) {
      formValue.tmorrmId.forEach((id: any) => {
        const tm = this.tmandRmDetails.find((t: any) => t.employeeId === id);
        if (tm) {
          filters.push({ type: 'tmorrmId', label: tm.fullName, value: id });
        }
      });
    }

    return filters;
  }

  removeFilter(filter: any) {
    const formValue = this.datepickerForm.value;
    const currentValues = formValue[filter.type] || [];
    const updatedValues = currentValues.filter((v: any) => v !== filter.value);
    this.datepickerForm.patchValue({ [filter.type]: updatedValues });
    this.getAllEmployeeDetails();
  }

  setDefaultmounth() {
    // Define current month's start & end
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();
    // Check if BehaviorSubject values exist
    const BehaviorDataexist = this.startDate && this.endDate;
    // If present → use them; else → fallback to month start/end
    const start = BehaviorDataexist ? dayjs(this.startDate).toDate() : startOfMonth;
    const end = BehaviorDataexist ? dayjs(this.endDate).toDate() : endOfMonth;
    // Patch form values
    this.datepickerForm.patchValue({
      dateRange: [start, end],
      resourceId: this.employeeId || null,
      projectId: this.filterData.projectId || null,
      clientId: this.filterData.clientId || null,
      departmentId: this.filterData.departmentId || null,
      tmorrmId: this.filterData.tmorrmId || null
    });
  }

  isShowtimesheetforteamRoute(): boolean {
    const showPaths = ['/project-management/timesheet/summary'];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  isShowtimesheetformyRoute(): boolean {
    const showPaths = ['/project-management/timesheet/mysummary'];
    return showPaths.some(path => this.router.url.startsWith(path));
  }

  // onCheckemployee(employeed: any) {
  //   if (employeed) {
  //     //  this.getProjectSummary(employeed);
  //     this.getEmployeeId(employeed);
  //   }
  //   else {
  //     //  this.getProjectSummary(this.employeeId);
  //     this.getEmployeeId(this.employeeId);
  //   }
  // }


  //graphs no data found conditions
  get hasprojectWiseHoursData(): boolean {
    return !!(
      this.projectTypeGraphData?.datasets?.length &&
      this.projectTypeGraphData?.datasets[0]?.data?.length
    );
  }

  get hasallocatedvsactualData(): boolean {
    return !!(
      this.estimatedVsActualGraphData?.datasets?.length &&
      this.estimatedVsActualGraphData?.datasets[0]?.data?.length
    );
  }

  getEmployeeId(employeeId: any) {
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employename = data;
      },
      error: (reason) => {
        console.log(reason);
      },
    });
  }

  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.routeToInfoMap = {
      '/project-management/timesheet/mysummary': MODULE_INFOS.My_Timesheet_Summary_view,
      '/project-management/timesheet/summary': MODULE_INFOS.Team_Timesheet_Summary_view
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.empdata?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data.filter((emp: IResourceDetail) => emp.id !== EmployeeId && emp.isReportee === true).map((emp: IResourceDetail) => ({
            ...emp,
            fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
            key: 'team'
          }));
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empdata?.employeeId;
    const formdata = this.datepickerForm.value;
    const filters = {
      clientId: formdata.clientId,
      projectId: formdata.projectId,
      departmentId: formdata.departmentId,
      reportingId: formdata.tmorrmId
    };
    this.subscription = this.sharedDataService.getAllEmployeeDetails(this.http, EmployeeId, filters).subscribe({
      next: (res: any) => {
        const employees = res.data || res || [];
        if (Array.isArray(employees)) {
          this.activeEmplist = this.sharedDataService.formatEmployeeList(employees, EmployeeId);
          const currentResourceId = this.datepickerForm.get('resourceId')?.value;
          if (currentResourceId && !this.activeEmplist.some((emp: any) => emp.value === currentResourceId)) {
            this.datepickerForm.patchValue({ resourceId: null });
          }
        } else {
          this.activeEmplist = [];
        }
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.activeEmplist = [];
      },
    });
  }

  isApplyDisabled(): boolean {
    const formValue = this.datepickerForm.value;
    const resourceId = formValue.resourceId;
    if (this.datepickerForm.invalid || !resourceId) {
      return true;
    }
    if (this.rbac.allowedToAccess('All Employees (Timesheet).view')) {
      return !this.activeEmplist || this.activeEmplist.length === 0 || 
             !this.activeEmplist.some((emp: any) => emp.value === resourceId);
    }
    if (this.rbac.allowedToAccess('My Team (Timesheet).view')) {
      return !this.resourcesList || this.resourcesList.length === 0 || 
             !this.resourcesList.some((emp: any) => emp.id === resourceId);
    }
    return false;
  }

  navigatetomy() {
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }

  onSubmit() {
    const resoureID = this.datepickerForm.get('resourceId')?.value || this.employeeId;
    const formValue = this.datepickerForm.value;
    this.filterService.setFilters(formValue);
    this.getProjectSummary(resoureID);
    this.getEmployeeId(resoureID);
    this.closeCanvas();
  }

  convertTimeToHours(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60; // e.g., "02:30" → 2.5
  }

  formatHoursToHHMM(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  getProjectSummary(resoureID: any) {
    const formValue = this.datepickerForm.value;
    // const [startDate, endDate] = formValue.dateRange || [];
    // const resourceId = formValue.resourceId ? `&resourceId=${formValue.resourceId}` : '';
    // const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
    // const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD');
    const url = `Timesheet/detailemployeesummary?resourceId=${resoureID || formValue.resourceId}`;
    this.http.getProjectSummary(url,formValue).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        const data: TimesheetSummaryResponse = res?.data || {};
        const graphSummary = res?.data?.graphSummary || {};
        this.totalhrs = res?.data?.totalLoggedHHMM || '00:00';
        this.projectTypeData = graphSummary?.projectWiseSummary || [];
        this.estimatedVsActualData = graphSummary?.allocatedVsActualSummary || [];
        const tsSummary = graphSummary?.timesheetSummary || {
          approved: '00:00',
          submitted: '00:00',
          rejected: '00:00'
        };
        this.approved = this.convertTimeToHours(tsSummary?.approved);
        this.submitted = this.convertTimeToHours(tsSummary?.submitted);
        this.rejected = this.convertTimeToHours(tsSummary?.rejected);
        // Percentages for bar visualization
        const total = this.approved + this.submitted + this.rejected;
        // avoid division by 0
        if (total > 0) {
          this.approvedPercent = (this.approved / total) * 100;
          this.submittedPercent = (this.submitted / total) * 100;
          this.rejectedPercent = (this.rejected / total) * 100;
        } else {
          this.approvedPercent = this.submittedPercent = this.rejectedPercent = 0;
        }
        // Display values in HH:mm format
        this.displayApproved = this.formatHoursToHHMM(this.approved);
        this.displaySubmitted = this.formatHoursToHHMM(this.submitted);
        this.displayRejected = this.formatHoursToHHMM(this.rejected);
        // Handle empty data gracefully — reset charts if needed
        if ((!this.projectTypeData || this.projectTypeData.length === 0) &&
          (!this.estimatedVsActualData || this.estimatedVsActualData.length === 0)) {
          this.resetCharts();
        } else {
          this.projectWiseChart();
          this.estimatedActualChart();
        }
        this.attendanceSummaryData = (data?.dailyData ?? []).map((item) => ({
          ...item,
          entries: Array.isArray(item.entries) ? item.entries : (item.entries ? [item.entries] : [])
        }));
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching attendance summary:', err);
        this.resetCharts();
        this.attendanceSummaryData = [];
      }
    });
  }

  resetCharts() {
    this.projectTypeGraphData = { labels: [], datasets: [] };
    this.estimatedVsActualGraphData = { labels: [], datasets: [] };
  }

  openModal(entries: TimesheetEntry[], content?: any) {
    this.selectedEntries = entries?.filter(ele => ele?.status !== 'Not Entered');
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  // Project Type (Pie)
  projectWiseChart() {
    if (!this.projectTypeData || this.projectTypeData?.length === 0) return;
    // Extract labels
    const labels = this.projectTypeData.map((item: any) => item.meta?.graphData?.code ? item.meta?.graphData?.code : item?.projectName);
    // Convert "HH:mm" string → numeric hours for plotting
    const data = this.projectTypeData.map((item: any) => {
      const [hours, minutes] = item.hours.split(':').map(Number);
      return hours + minutes / 60;
    });
    // Keep original HH:mm values for display
    const originalTimes = this.projectTypeData.map((item: any) => item?.hours);
    // Chart colors
    const backgroundColors = [
      '#FFD54F', '#E91E63', '#4DB6AC', '#64B5F6',
      '#81C784', '#3F51B5', '#FF8A65', '#BA68C8',
    ].slice(0, labels.length);
    // Store for legend display (outside chart)
    this.projectTypeLabelData = labels.map((label: string, index: number) => ({
      label,
      color: backgroundColors[index],
      hours: originalTimes[index],
    }));
    // Chart data
    this.projectTypeGraphData = {
      labels,
      datasets: [
        {
          label: 'Project Hours (in Hrs)',
          data,
          backgroundColor: backgroundColors,
        },
      ],
    };
    // Chart options
    this.projectTypeGraphOptions = {
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { size: 11 },
          bodyFont: { size: 10 },
          callbacks: {
            title: (tooltipItems: any) => {
              const index = tooltipItems[0]?.dataIndex;
              const name = this.projectTypeData[index]?.projectName;
              // Wrap long names (max 20 chars per line)
              return name.match(/.{1,20}/g);
            },
            label: (tooltipItem: any) => {
              const value = Number(tooltipItem?.raw).toFixed(2);
              return `Project Hours (in Hrs): ${value}`;
            }
          }
        }
      }
    };
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    if (!this.estimatedVsActualData || this.estimatedVsActualData?.length === 0) return;
    // Extract labels
    const labels = this.estimatedVsActualData.map((item: any) => item?.meta?.graphData?.code ? item?.meta?.graphData?.code : item?.projectName);
    // Convert estimated hours to numbers (already numeric strings)
    const estimatedData = this.estimatedVsActualData.map((item: any) => Number(item?.estimatedHours) || 0);
    // Convert "HH:mm" to numeric hours for actualHours
    const actualData = this.estimatedVsActualData.map((item: any) => {
      const [h, m] = item?.actualHours.split(':').map(Number);
      const actualDecimal = h + (m / 60);   // convert HH:mm → decimal
      const overdue = Number(item?.overDue || 0);  // overdue already decimal
      return actualDecimal - overdue;   // REMOVE overdue from actual
    });
    // Convert overdue (may come as string)
    const overdueData = this.estimatedVsActualData.map((item: any) => Number(item?.overDue) || 0);
    // Chart datasets
    this.estimatedVsActualGraphData = {
      labels: labels,
      datasets: [
        {
          label: 'Estimated Hours',
          backgroundColor: '#1A237E',
          data: estimatedData,
          stack: 'Estimated'
        },
        {
          label: 'Actual Hours',
          backgroundColor: '#90CAF9',
          data: actualData,
          stack: 'ActualOverdue'
        },
        {
          label: 'Over Due',
          backgroundColor: '#FF5252',
          data: overdueData,
          stack: 'ActualOverdue'
        }
      ]
    };
    // Chart options
   this.estimatedVsActualGraphOptions = {
      responsive: true,
      barThickness: 30,
      scales: {
        x: {
          stacked: false,
          grid: { display: false, },
          ticks: { color: '#141414' },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: 'Hours', color: '#505050',  },
          ticks: { color: '#72777B', },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { size: 11 },
          bodyFont: { size: 10 },
          callbacks: {
            title: (tooltipItems: any) => {
              if (!tooltipItems || !tooltipItems?.length) return '';
              const ti = tooltipItems[0];
              let index = ti.dataIndex;
              if (index === undefined || index === null) {
                const label = ti.label ?? ti.title ?? '';
                index = this.estimatedVsActualGraphData?.labels?.indexOf(label);
              }
              const project = (typeof index === 'number' && index >= 0) ? this.estimatedVsActualData?.[index]?.projectName : (ti.label ?? '');
              return project || '';
            },
            label: (tooltipItem: any) => {
              const datasetLabel = tooltipItem?.dataset?.label || '';
              const value = tooltipItem?.raw;
              return `${datasetLabel}: ${value}`;
            }
          }
        }
      },
    };
  }

  navigatetoteam() {
    this.router.navigate(['project-management/timesheet/teamtimesheet']);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.http.clearTeamDateRange();
  }
  toggleFilters(content: any) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }
}