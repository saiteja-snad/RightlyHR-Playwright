import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { AuthService } from '../../../services/auth.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { DropdownModule } from 'primeng/dropdown';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import * as XLSX from 'xlsx';
import { IAttendanceDetails } from '../../../Interfaces/reports.model';
import { environment } from '../../../../environments/environment';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { Client } from '../../../clients.model';
import { TimesheetReportTabsComponent } from '../../../shared/reports-tabs/timesheet-report-tabs/timesheet-report-tabs.component';
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-my-timesheet-report',
  imports: [DatePicker, NgbPopoverModule, CommonModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent, InfoIconComponent],
  templateUrl: './my-timesheet-report.component.html',
  styleUrl: './my-timesheet-report.component.scss'
})
export class MyTimesheetReportComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredmytimesheetRecord: any[] = [];
  projectsData: any[] = [];
  MyTimesheetReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  destroy$ = new Subject<boolean>();
  empinfo: any;
  clients: Client[] = [];
  projects: TimesheetReportTabsComponent[] = [];
  noclientproject = false;
  BillableOptions = [
    { key: 'Yes', value: 'true' },
    { key: 'No', value: 'false' },
  ];
  TimesheetStatus = [
    { key: 'Waiting for Approval', value: 'Waiting for Approval' },
    { key: 'Approved', value: 'Processed' },
    { key: 'Rejected', value: 'Rejected' },
  ];
  clientDropdownList: { label: string; value: number }[] = [];
  resourcesArrayList: any;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
   today: Date = new Date();
  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private conformationPopup: OpenModalService,
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getResourceData();
  }

  initializeForm() {
    this.MyTimesheetReportForm = this.fb.group({
      client: [null],
      project: [{ value: null, disabled: true }],
      dateRange: [null],
      status: [null],
      billable: [null]
    });
    this.MyTimesheetReportForm.addControl('projects', this.fb.array([]));
    this.MyTimesheetReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

isFilterApplied(): boolean {
  const formValue = this.MyTimesheetReportForm.value;

  return (
    (formValue.client !== null && formValue.client !== undefined && formValue.client !== '') ||
    (formValue.project !== null && formValue.project !== undefined && formValue.project !== '') ||
    (formValue.billable && formValue.billable.value !== null && formValue.billable.value !== undefined) ||
    (formValue.status && formValue.status.value !== null && formValue.status.value !== undefined) ||
    (formValue.dateRange && Array.isArray(formValue.dateRange) && formValue.dateRange.length > 0)
  );
}
  clearAllFilters(): void {
    this.MyTimesheetReportForm.reset();
    this.filteredmytimesheetRecord = [];
    this.MyTimesheetReportForm.get('project')?.disable();
    this.collectionSize = 0;
  }

  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generatemytimesheetReport(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
     this.generatemytimesheetReport(this.page, this.pageSize,false);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generatemytimesheetReport(this.page, this.pageSize, false);
  }
  //GET CLIENT AND PROJECT
  getResourceData() {
    this.http
      .getDataIncludeParams(`ProjectResource?status=active&employeeId=${this.empinfo.employeeId}&isProjectRequired=true`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.success) {
          const rawData = res.data;

          // Group projects under each client
          this.clients = rawData.reduce((acc: any[], curr: any) => {
            const existingClient = acc.find((c) => c.clientId === curr.client.clientId);

            const projectObj = {
              projectId: curr.project.projectId,
              projectName: curr.project.projectName,
              startDate: curr.startDate,
              endDate: curr.endDate,
              status: curr.status,
              role: curr.role,
              isWeekendAllowed: curr.project.isWeekendAllowed || curr.client.isWeekendAllowed,
              isOverTimeAllowed: curr.project.isOverTimeAllowed || curr.client.isOverTimeAllowed,
              isBillable: curr.project.isbillable || curr.client.isbillable,
            };

            if (existingClient) {
              existingClient.projects.push(projectObj);
            } else {
              acc.push({
                clientId: curr.client.clientId,
                clientName: curr.client.clientName,
                projects: [projectObj],
                shift: curr.shift,
              });
            }
            return acc;
          }, []);

          // Add "No Client/No Project" option
          if (!this.noclientproject) {
            this.clients.unshift({
              clientId: 0,
              clientName: 'No Client',
              projects: [
                {
                  projectId: 0,
                  projectName: 'No Project',
                  isNoClientProject: true,
                },
              ],
              taxId: '',
              websiteUrl: '',
              industryType: '',
              logoPath: '',
              address: '',
              status: '',
              overtimeEligibile: false,
              billable: false,
              weekendWorkAllowed: false,
              createdBy: {
                id: 0,
                name: ''
              },
              updatedBy: {
                id: 0,
                name: ''
              },
              createdAt: '',
              updatedAt: '',
              contact: {
                contactId: 0,
                entityRefId: 0,
                name: '',
                email: '',
                phoneNumber: '',
                phoneCountryCode: '',
                phoneDialCode: '',
                role: '',
                primaryContact: false,
                active: false,
                createdAt: '',
                updatedAt: ''
              }
            });
          }

          // Prepare dropdown data for <p-select>
          this.clientDropdownList = this.clients.map((c) => ({
            label: c.clientName,
            value: c.clientId,
          }));
        }
      });
  }

  // Called on client dropdown change
  getAllActiveProjects(event: any) {
    const selectedClientId = event.value;
    const selectedClient = this.clients.find((c) => c.clientId === selectedClientId);
// Always reset project when client changes
  const projectControl = this.MyTimesheetReportForm.get('project');
  projectControl?.reset();
  this.projectsData = [];

    if (selectedClient && selectedClient.projects) {
      this.projectsData = selectedClient.projects.map((p: any) => ({
        displayprojectName: p.projectName,
        projectId: p.projectId,
      }));

      this.MyTimesheetReportForm.get('project')?.enable(); // enable when client chosen
    } else {
      this.projectsData = [];
      this.MyTimesheetReportForm.get('project')?.setValue(0);
      this.MyTimesheetReportForm.get('project')?.reset();
      this.MyTimesheetReportForm.get('project')?.disable(); // disable if no projects or no client
    }
  }

  get isLeaveGenerateDisabled(): boolean {
    const { client, project, dateRange, billable, status } = this.MyTimesheetReportForm.value;
    const hasClient = client !== null && client !== undefined;
    const hasProject = project !== null && project !== undefined;
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasBillable = billable !== null && billable !== undefined;
    const hasStatus = status !== null && status !== undefined;

    return !(hasClient || hasProject || hasDateRange || hasBillable || hasStatus);
  }
  buildTimesheetReportParams() {
    const formValue = this.MyTimesheetReportForm.value;
    const employeeId = this.empinfo?.employeeId || 0;

    // format date as MM/dd/yyyy
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const startDate = formValue.dateRange?.[0] ? formatDate(formValue.dateRange[0]) : null;
    const endDate = formValue.dateRange?.[1] ? formatDate(formValue.dateRange[1]) : null;
    const params: any = {
      ReportType: 'MyTimesheet',
      //EmployeeIds: employeeId,
      // ClientIds: formValue.client ? formValue.client : 0,   
      //  ProjectIds: formValue.project ? formValue.project : 0 
    };
    if (formValue.client !== null && formValue.client !== undefined) {
      params.ClientIds = formValue.client ? formValue.client : 0;
    }

    if (formValue.project !== null && formValue.project !== undefined) {
      params.ProjectIds = formValue.project ? formValue.project : 0;
    }
    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (formValue.billable?.value) params.Billable = formValue.billable.value;
    if (formValue.status?.value) params.Statuses = formValue.status.value;
    return params;
  }

  generatemytimesheetReport(page: number, pageSize: number, showLoader: boolean = true) {
    if (this.MyTimesheetReportForm.invalid) {
      return;
    }

     if (showLoader) {
    this.spinnerLoader1 = true;
  }
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${page}&pageSize=${pageSize}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.collectionSize = res.data.totalCount;
        this.spinnerLoader1 = false;
        if (res.success && res.data?.items) {
          this.filteredmytimesheetRecord = res.data.items;
          this.disableBtn = false;
        } else {
          this.filteredmytimesheetRecord = [];
        }
      },
      error: (err) => {
        this.spinnerLoader1 = false;
        console.error('Error fetching report:', err);
        this.filteredmytimesheetRecord = [];
        this.disableBtn = true;
      },
    });
  }

  exportmytimesheetreport() {
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();

    this.http.downloadTimesheetReport(
      `TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}`
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        // Extract filename from Content-Disposition
        let filename = 'mytimesheet.xlsx';
        const contentDisposition = response.headers.get('content-disposition');

        if (contentDisposition) {
          // Handle both regular and UTF-8 encoded filenames
          const utf8FilenameMatch = contentDisposition.match(/filename\*\=UTF\-8''([^;]+)/);
          const asciiFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

          if (utf8FilenameMatch && utf8FilenameMatch[1]) {
            filename = decodeURIComponent(utf8FilenameMatch[1]);
          } else if (asciiFilenameMatch && asciiFilenameMatch[1]) {
            filename = asciiFilenameMatch[1];
          }
        }

        // Download the blob as before
        const blob = new Blob([response.body!], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        console.log('Downloaded file:', filename);
        this.conformationPopup.openSuccessModal("Report Exported Successfully");
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('No records found');
      },
      complete: () => { }
    });
  }


  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
