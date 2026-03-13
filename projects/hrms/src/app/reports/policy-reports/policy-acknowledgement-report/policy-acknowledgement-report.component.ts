import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
@Component({
  selector: 'app-policy-acknowledgement-report',
  imports: [CommonModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule, 
    NoDataFoundComponent, DataLoaderContentComponent, ModuleInformationComponent, DateformatPipe, NgbPopoverModule],
  templateUrl: './policy-acknowledgement-report.component.html',
  styleUrl: './policy-acknowledgement-report.component.scss'
})

export class PolicyAcknowledgementReportComponent implements OnInit, OnDestroy {
  policyAcknowledgementReport!: FormGroup;
  subscription!: Subscription;
  selectedPolicyId: any;
  acknowledged: any;
  policyAcknowledgementReports: IPolicyAcknowledgementReports[] = [];
  exportClicked: any;
  isReportGenerated = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  isLoading: boolean = false;
  moduleinfo: string = '';
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
    { label: 'No', value: false }
  ];

  constructor(private http: HttpService, private fb: FormBuilder, public rbac: RbacService, 
    public readonly router: Router, private offcanvasService: NgbOffcanvas) { }

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
    setTimeout(() => {
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

    const modifiedData = this.policyAcknowledgementReports.map((record) => {
      const modifiedRecord: any = {};
      const recordAny = record as any;
      NEW_SEQUENCE.forEach((columnName) => {
        const originalKey = Object.keys(HEADER_MAPPINGS).find(
          (key) => HEADER_MAPPINGS[key] === columnName
        );
        if (originalKey && record.hasOwnProperty(originalKey)) {
          if (originalKey === 'acknowledgedDate' && recordAny[originalKey]) {
            const date = new Date(recordAny[originalKey]);
            const month = date.toLocaleString('default', { month: 'short' });
            const formattedDate = `${month} ${date.getDate()} ${date.getFullYear()}`;
            modifiedRecord[columnName] = formattedDate;
          } else if (originalKey === 'acknowledged') {
            modifiedRecord[columnName] =
              recordAny[originalKey] === true ? 'Yes' : 'No';
          } else {
            modifiedRecord[columnName] = recordAny[originalKey];
          }
        } else {
          modifiedRecord[columnName] = '-';
        }
      });
      return modifiedRecord;
    });

    // Create worksheet and merge header
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } },
    ];
    XLSX.utils.sheet_add_aoa(ws, [['POLICY ACKNOWLEDGEMENT REPORT']], {
      origin: 'A1',
    });

    // Add headers
    XLSX.utils.sheet_add_aoa(ws, [NEW_SEQUENCE], { origin: 'A2' });

    // Add data
    XLSX.utils.sheet_add_json(ws, modifiedData, {
      origin: 'A3',
      skipHeader: true,
    });

    // Style title row
    const titleCell = ws['A1'] || {
      t: 's',
      v: 'POLICY ACKNOWLEDGEMENT REPORT',
    };
    titleCell.s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' },
    };
    ws['A1'] = titleCell;

    // Style headers
    NEW_SEQUENCE.forEach((_, idx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: idx });
      const cell = ws[cellAddress] || {};
      cell.s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
      };
      ws[cellAddress] = cell;
    });

    // Style data rows
    for (let row = 2; row < modifiedData.length + 2; row++) {
      NEW_SEQUENCE.forEach((_, col) => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = ws[cellAddress] || {};
        cell.s = { alignment: { horizontal: 'center', vertical: 'middle' } };
        ws[cellAddress] = cell;
      });
    }

    // Auto-fit column widths
    ws['!cols'] = NEW_SEQUENCE.map((column) => {
      const maxLength = Math.max(
        ...modifiedData.map((d) => d[column]?.toString().length || 0)
      );
      return { wch: Math.max(column.length, maxLength) + 2 };
    });

    // Generate Excel
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Policy Acknowledgement');

    const selectedPolicyId = this.policyAcknowledgementReport.get('policy')?.value;
    const selectedPolicy = this.policyItemsData.find(
      (p: { id: number; policyName: string }) => p.id === Number(this.policyAcknowledgementReport.get('policy')?.value)
    );
    const policyName =
      selectedPolicy?.policyName
        ?.replace(/[^a-zA-Z0-9-_ ]/g, '') || 'Policy Report';
    const fileName = `Policy Acknowledgement Report ${policyName} ${dayjs().format('MMM DD YYYY')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    this.spinnerLoader2 = false;
    }, 100);
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}