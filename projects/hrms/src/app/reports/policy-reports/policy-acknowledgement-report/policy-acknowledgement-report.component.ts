import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { ModuleInformationComponent } from '../../../shared/module-information/module-information.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { filter, Subscription } from 'rxjs';
import { IPolicyAcknowledgementReports } from './policy-acknowledgement-report';
import * as XLSX from 'xlsx-js-style';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from 'primeng/table';
import dayjs from 'dayjs';

@Component({
  selector: 'app-policy-acknowledgement-report',
  imports: [CommonModule,
    FormsModule,
    DropdownModule,
    SelectModule,
    TranslateModule,
    ReactiveFormsModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    ModuleInformationComponent, 
    DateformatPipe,
    NgbPopoverModule,
    TableModule
  ],
  templateUrl: './policy-acknowledgement-report.component.html',
  styleUrl: './policy-acknowledgement-report.component.scss'
})
export class PolicyAcknowledgementReportComponent implements OnInit, OnDestroy{
  @ViewChild('policyTable') policyTable!: Table;
  policyAcknowledgementReport! : FormGroup;
  subscription!: Subscription;
  selectedPolicyId: any;
  acknowledged: any;
  policyAcknowledgementReports: IPolicyAcknowledgementReports[] = [];
  originalPolicyAcknowledgementReports: IPolicyAcknowledgementReports[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;
  exportClicked: any;
  isReportGenerated = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  isLoading: boolean = false;
  moduleinfo : string = '';
  selectedLocationId: any;
  selectedSubLocationId: any;
  year: any;
  selectedShiftId: any;
  policyData = {} as any;
  policyItemsData: any;
  yearDetails: any[] = [];
  currentYear: number = new Date().getFullYear();
  jobLocationDropDownData: any = [];
  subLocationsDropdown: any = [];
  shiftDropdown: any[] = [];
  [key: string]: any;

  AcknoeledgementOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value:  false}
  ]; 

  constructor(
    private authService: AuthService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) { }

 ngOnInit(): void {
  this.initializeForm();
  this.getAllYears();
  this.updateModuleInfo();
  this.initiateUpdateModuleInfo();
  this.getjobLocationList();
 }

 initializeForm() {
  this.policyAcknowledgementReport = this.fb.group({
    year: [null, Validators.required],
    location: [null, Validators.required],
    subLocation: [null, Validators.required],
    shift: [null, Validators.required],
    policy: [null, Validators.required],
    acknowledged: [null, Validators.required]
  });

  this.policyAcknowledgementReport.valueChanges.subscribe(() => {
    // Disable export if any field changes
    this.isReportGenerated = false;
    this.isFilterIndicatorActive = false;
  });

  this.policyAcknowledgementReport.get('year')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.get('location')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('subLocation')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('shift')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('policy')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('acknowledged')?.reset(null, { emitEvent: false });
    this.clearDropdowns(['subLocationsDropdown', 'shiftDropdown', 'policyItemsData']);
  });

  this.policyAcknowledgementReport.get('location')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.get('subLocation')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('shift')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('policy')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('acknowledged')?.reset(null, { emitEvent: false });
    this.clearDropdowns(['subLocationsDropdown', 'shiftDropdown', 'policyItemsData']);
  });

  this.policyAcknowledgementReport.get('subLocation')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.get('shift')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('policy')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('acknowledged')?.reset(null, { emitEvent: false });
    this.clearDropdowns(['shiftDropdown', 'policyItemsData']);
  });

  this.policyAcknowledgementReport.get('shift')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.get('policy')?.reset(null, { emitEvent: false });
    this.policyAcknowledgementReport.get('acknowledged')?.reset(null, { emitEvent: false });
    this.clearDropdowns(['policyItemsData']);
  });

  this.policyAcknowledgementReport.get('policy')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.get('acknowledged')?.reset(null, { emitEvent: false });
  });
}

getAllYears() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.yearDetails.push({ year: i });
    }
  }

clearDropdowns(keys: string[]) {
  keys.forEach((key) => {
    if (this[key]) {
      this[key] = [];
    }
  });
}


  generateYears(startYear: number, endYear: number) {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ name: year, value: year });
    }
    return years;
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/reports/policy-reports/policy-acknowledgment-report': MODULE_INFOS.POLICY_REPORTS_POLICY_ACK_REPORT_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getjobLocationList() {
      this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        // Fetch sub-locations for each location
        const subLocationRequests = locations.map((location: { id: any; }) =>
          this.http.getData(`JobLocation/sub-location-by-joblocation/${location.id}`)
        );
      }
    });
    }

   getSubLocationByid(selectedLocation: any): void {
      if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`).subscribe({
            next: (data: any) => {
                this.subLocationsDropdown = data.jobSubLocations;
                 this.shiftDropdown = []; 
            },
            error: (error: any) => {
              console.log(error?.error?.Message);
            },
          });
      } else {
        this.subLocationsDropdown = [];
        this.shiftDropdown = [];
      }
    }

      getShiftBYid(selectedSubLocation: any): void {
      const formValue = this.policyAcknowledgementReport.value;
      if (selectedSubLocation && selectedSubLocation) {
        const locationId = formValue.location?.id
        const subLocationId = selectedSubLocation
      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
            next: (data: any) => {
              if (data.length === 0) {
                this.shiftDropdown = [];
              } else {
                this.shiftDropdown = [].concat(
                  ...data.map((element: any) => element.orgShiftsItems)
                );
              }
            },
            error: (err: any) => {
              console.error('Error fetching shift data:', err);
              this.shiftDropdown = []; // Reset on error
            },
          });
      } else {
        this.shiftDropdown = []; // Reset if no sub-location is selected
      }
    }

  getpolicys() {
    const { location, subLocation, shift, year } = this.policyAcknowledgementReport.value;

    this.subscription = this.http
      .getData(
       `v2/orgPolicies/getpolicybylocation?locationId=${location.id}&subLocationId=${subLocation}&shiftId=${shift}&Applicableyear=${year}`
      )
      .subscribe({
        next: (response: any) => {
          this.policyItemsData = response;
          this.policyItemsData = [].concat(
            ...response.map((element: any) =>
              (element.orgPolicyItems || []).filter(
                (item: any) => item.requiresAcknowledgment === true
              )
            )
          );
        },
        error: (reason: any) => console.log(reason),
      });
  }

  generatePolicyAckReport() {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    this.isFilterIndicatorActive = this.isFilterApplied();

    const { policy, acknowledged } = this.policyAcknowledgementReport.value;
    let url = `Reports/PolicyAcknowledgeReports?policyId=${policy}`;
    if (acknowledged && acknowledged.value !== 'All') {
      url += `&acknowledged=${acknowledged.value}`;
    }

    this.subscription = this.http
      .getData(url)
      .subscribe({
        next: (data: any) => {
          this.policyAcknowledgementReports = data;
          this.originalPolicyAcknowledgementReports = [...this.policyAcknowledgementReports];
          this.currentSortField = '';
          this.currentSortOrder = 0;
          this.isReportGenerated = Array.isArray(data) && data.length > 0;
          this.isLoading = false;
          this.spinnerLoader1 = false;
        },
        error: (error: any) => {
          console.error('Error fetching leave records', error);
          this.isReportGenerated = false;
          this.isLoading = false;
          this.spinnerLoader1 = false;
          this.isFilterIndicatorActive = false;
          this.closeCanvas();
        },
        complete: () => {
          this.spinnerLoader1 = false;
          this.isLoading = false;
          this.closeCanvas();
        }
      });
  }

  get isPolicyAckGenerateDisabled(): boolean {
    const form = this.policyAcknowledgementReport;
    return !(
      form.get('year')?.value ||
      form.get('location')?.value ||
      form.get('subLocation')?.value ||
      form.get('shift')?.value ||
      form.get('policy')?.value ||
      form.get('acknowledged')?.value
    );
  }

  isFilterApplied(): boolean {
    const { year, location, subLocation, shift, policy, acknowledged } = this.policyAcknowledgementReport.value;
    return !!(year || location || subLocation || shift || policy || (acknowledged && acknowledged.value !== 'All'));
  }

  showClearAllButton(): boolean {
    return this.isFilterApplied();
  }

  clearAllFilters(): void {
    this.policyAcknowledgementReport.reset();
    this.policyAcknowledgementReport.patchValue({
      acknowledged: null
    });
    this.clearDropdowns(['subLocationsDropdown', 'shiftDropdown', 'policyItemsData']);
    this.policyAcknowledgementReports = [];
    this.isReportGenerated = false;
    this.isFilterIndicatorActive = false;
  }

  openFilter(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  exportToExcelPolicyAck(): void {
    this.spinnerLoader2 = true;

    const dataToExport = this.policyTable?.filteredValue ?? this.policyTable?.value ?? this.policyAcknowledgementReports;

    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      subdepartment: 'TEAM',
      teamManagerName: 'TEAM MANAGER',
      workEmail: 'WORK EMAIL',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      shift: 'SHIFT',
      source: 'SOURCE',
      acknowledged: 'ACKNOWLEDGED',
      acknowledgedDate: 'ACKNOWLEDGED DATE',
      policyName: 'POLICY NAME',
    };

    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM',
      'TEAM MANAGER',
      'WORK EMAIL',
      'LOCATION',
      'SUB LOCATION',
      'SHIFT',
      'SOURCE',
      'ACKNOWLEDGED',
      'ACKNOWLEDGED DATE',
      'POLICY NAME',
    ];

    const normalizeCell = (key: string, value: any) => {
      if (key === 'acknowledgedDate') {
        if (!value) return '-';
        const date = new Date(value);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()} ${date.getFullYear()}`;
      }
      if (key === 'acknowledged') return value === true ? 'Yes' : value === false ? 'No' : '-';
      if (value === null || value === undefined) return '-';
      if (typeof value === 'string') return value.trim().length > 0 ? value.trim() : '-';
      return value;
    };

    const modifiedData = dataToExport.map((record: any) => {
      const row: any = {};
      NEW_SEQUENCE.forEach(col => {
        const originalKey = Object.keys(HEADER_MAPPINGS).find(k => HEADER_MAPPINGS[k] === col);
        row[col] = originalKey && record.hasOwnProperty(originalKey) ? normalizeCell(originalKey, record[originalKey]) : '-';
      });
      return row;
    });

    if (modifiedData.length === 0) {
      const emptyRow: any = {};
      NEW_SEQUENCE.forEach(col => { emptyRow[col] = '-'; });
      modifiedData.push(emptyRow);
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];
    XLSX.utils.sheet_add_aoa(ws, [['POLICY ACKNOWLEDGEMENT REPORT']], { origin: 'A1' });
    ws['A1'].s = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center', vertical: 'center' } };

    XLSX.utils.sheet_add_aoa(ws, [NEW_SEQUENCE], { origin: 'A2' });
    NEW_SEQUENCE.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 1, c: index });
      ws[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };
    });

    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });
    modifiedData.forEach((_: any, rowIndex: number) => {
      NEW_SEQUENCE.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex });
        if (ws[cellRef]) {
          ws[cellRef].s = { alignment: { horizontal: 'center', vertical: 'center' } };
        }
      });
    });

    ws['!autofilter'] = { ref: `A2:${XLSX.utils.encode_col(NEW_SEQUENCE.length - 1)}2` };
    ws['!cols'] = NEW_SEQUENCE.map(col => ({
      wch: Math.max(col.length, ...modifiedData.map((r: any) => String(r[col] ?? '').length)) + 2
    }));

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Policy Acknowledgement');
    const selectedPolicy = this.policyItemsData?.find(
      (p: { id: number; policyName: string }) => p.id === Number(this.policyAcknowledgementReport.get('policy')?.value)
    );
    const policyName = selectedPolicy?.policyName?.replace(/[^a-zA-Z0-9-_ ]/g, '') || 'Policy Report';
    XLSX.writeFile(wb, `Policy Acknowledgement Report ${policyName} ${dayjs().format('MMM DD YYYY')}.xlsx`);
    this.spinnerLoader2 = false;
  }

  getColumnWidth(data: any[], columnName: string): number {
    // Find the maximum width of data in the column
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);

    // Set minimum width to 10
    return Math.max(10, maxWidth);
  }
customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.policyAcknowledgementReports = [...this.originalPolicyAcknowledgementReports];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.policyTable) this.policyTable.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = a[field];
      let val2 = b[field];

      // Handle fusionEmpId numeric sorting
      if (field === 'fusionEmpId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      // Handle date sorting for acknowledgedDate
      if (field === 'acknowledgedDate') {
        const date1 = val1 ? new Date(val1).getTime() : 0;
        const date2 = val2 ? new Date(val2).getTime() : 0;
        return event.order * (date1 - date2);
      }

      // Handle boolean sorting for acknowledged field
      if (field === 'acknowledged') {
        // Convert boolean to number: true=1, false=0, null/undefined=-1
        const bool1 = val1 === true ? 1 : val1 === false ? 0 : -1;
        const bool2 = val2 === true ? 1 : val2 === false ? 0 : -1;
        return event.order * (bool1 - bool2);
      }

      // String sorting (default)
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }
  ngOnDestroy(): void {
      if(this.subscription){
        this.subscription.unsubscribe();
      }
  }
}
