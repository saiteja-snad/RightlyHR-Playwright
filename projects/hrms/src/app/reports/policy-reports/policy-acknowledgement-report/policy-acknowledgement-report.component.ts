import { Component, OnDestroy, OnInit } from '@angular/core';
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
import * as XLSX from 'xlsx';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

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
    NgbPopoverModule
  ],
  templateUrl: './policy-acknowledgement-report.component.html',
  styleUrl: './policy-acknowledgement-report.component.scss'
})
export class PolicyAcknowledgementReportComponent implements OnInit, OnDestroy{
  policyAcknowledgementReport! : FormGroup;
  subscription!: Subscription;
  selectedPolicyId: any;
  acknowledged: any;
  policyAcknowledgementReports: IPolicyAcknowledgementReports[] = [];
  exportClicked: any;
  isReportGenerated = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  isLoading: boolean = false;
  moduleinfo : string = '';
  selectedLocationId: any;
  selectedSubLocationId: any;
  year: any;
  selectedShiftId: any;
  policyData = {} as any;
  policyItemsData: any;
  yearDetails: number[] = [];
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
    public readonly router: Router
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
  });

  this.policyAcknowledgementReport.get('year')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.patchValue({
      location: null,
      subLocation: null,
      shift: null,
      policy: null,
      acknowledged: null
    }, { emitEvent: false });
    // this.clearDropdowns(['jobLocationDropDownData', 'subLocationsDropdown', 'shiftDropdown', 'policyItemsData']);
  });

  this.policyAcknowledgementReport.get('location')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.patchValue({
      subLocation: null,
      shift: null,
      policy: null,
      acknowledged: null
    }, { emitEvent: false });
    // this.clearDropdowns(['subLocationsDropdown', 'shiftDropdown', 'policyItemsData']);
    // this.getSubLocationByid();
  });

  this.policyAcknowledgementReport.get('subLocation')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.patchValue({
      shift: null,
      policy: null,
      acknowledged: null
    }, { emitEvent: false });
    // this.clearDropdowns(['shiftDropdown', 'policyItemsData']);
    // this.getShiftBYid();
  });

  this.policyAcknowledgementReport.get('shift')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.patchValue({
      policy: null,
      acknowledged: null
    }, { emitEvent: false });
    // this.clearDropdowns(['policyItemsData']);
    // this.getpolicys();
  });

  this.policyAcknowledgementReport.get('policy')?.valueChanges.subscribe(() => {
    this.policyAcknowledgementReport.patchValue({
      acknowledged: null
    }, { emitEvent: false });
  });
}

getAllYears() {
      for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
        this.yearDetails.push(i);
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
      '/reports/policy-reports/policy-acknowledgment-report': MODULE_INFOS.ATTENDANCE_ABSENT_REPORTS_MODULE_INFO
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

        onLocationChange(locationId: any) {
      if (locationId) {
        this.getSubLocationByid(locationId);
        // this.policyAcknowledgementReport.get('subLocation')?.enable();
        // this.policyAcknowledgementReport.get('shift')?.disable();
        // this.policyAcknowledgementReport.get('subLocation')?.markAsTouched();
      } else {
        // this.jobLocationDropDownData = [];
        // this.subLocationsDropdown=[];
        // this.policyAcknowledgementReport.get('subLocation')?.disable();
        // this.policyAcknowledgementReport.get('shift')?.disable();
      }
    }


   getSubLocationByid(selectedLocation: any): void {
      if (selectedLocation && selectedLocation.id) {
          // Reset subLocation and shift fields when location changes
      // this.policiesForm.patchValue({
      //   subLocation: null,
      //   shift: null
      // });
      // this.subLocationsDropdown = [];
      // this.shiftDropdown = [];
        this.subscription = this.http
          .getData(
            `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
          )
          .subscribe({
            next: (data: any) => {
              if (data.length === 0) {
            //     this.subLocationsDropdown = [];
            //      this.shiftDropdown = []; 
            //      this.policiesForm.get('subLocation')?.enable();
            // this.policiesForm.get('shift')?.disable();
              } else {
                this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
                 this.shiftDropdown = []; 
                // this.policiesForm.get('subLocation')?.enable();
                // this.policiesForm.get('shift')?.disable();
              }

            },
            error: (error: any) => {
             if (error.error) {
            // this.confirmation.openErrorModal(error.error.Message);
          }
            },
          });
      } else {
        this.subLocationsDropdown = [];
        this.shiftDropdown = [];
        
      }
    }

    onSubLocationChange(subLocationId: any) {
      if (subLocationId) {
        this.getShiftBYid(subLocationId);
        // this.policiesForm.get('shift')?.enable();
        //  this.shiftDropdown = []; 
        //  this.policiesForm.get('shift')?.markAsTouched();
      } else {
        // this.subLocationsDropdown=[];
        //  this.shiftDropdown = []; 
        // this.policiesForm.get('shift')?.disable();
      }
    }


      getShiftBYid(selectedSubLocation: any): void {
      const formValue = this.policyAcknowledgementReport.value;
      if (selectedSubLocation && selectedSubLocation) {
                // Reset subLocation and shift fields when location changes
      // this.policyAcknowledgementReport.patchValue({
      //   shift: null
      // });
      // this.shiftDropdown = [];
        const locationId = formValue.location?.id
        const subLocationId = selectedSubLocation
  
        this.subscription = this.http
          .getData(
            `orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`
          )
          .subscribe({
            next: (data: any) => {
  
              if (data.length === 0) {
                this.shiftDropdown = []; // Reset if no shifts are found
                // this.isShiftAvailable = false;
              } else {
                 
                this.shiftDropdown = [].concat(
                  ...data.map((element: any) => element.orgShiftsItems)
                  
                ); // Flatten the shift data
                // this.isShiftAvailable = false;
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

    onShiftChange(selectedShift: any): void {
    // console.log('Selected Shift:', selectedShift);
    // this.selectedShiftId = selectedShift.value;
    // this.policyData.policy = undefined;
    // this.policyData.acknowledged = undefined;
    this.getpolicys();
  }

  getpolicys() {
    const { location, subLocation, shift, year } = this.policyAcknowledgementReport.value;

    this.subscription = this.http
      .getData(
       `v2/orgPolicies/getpolicybylocation?locationId=${location.id}&subLocationId=${subLocation}&shiftId=${shift}&Applicableyear=${year}`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.policyItemsData = response;
          this.policyItemsData = [].concat(
            ...response.map((element: any) =>
              (element.orgPolicyItems || []).filter(
                (item: any) => item.requiresAcknowledgment === true
              )
            )
          );
          console.log(this.policyItemsData);
        },
        error: (reason: any) => console.log(reason),
      });
  }

  generatePolicyAckReport() {
    // this.spinnerLoader1 = true;
    this.isLoading = true;

    const { policy, acknowledged } = this.policyAcknowledgementReport.value;
    console.log(acknowledged);

    this.subscription = this.http
      .getData(
        `Reports/PolicyAcknowledgeReports?policyId=${policy}&acknowledged=${acknowledged.value}`
      )
      .subscribe({
        next: (data: any) => {
          console.log('Policy Acknowledgement Reports:', data);

          this.policyAcknowledgementReports = data;
          this.isReportGenerated = Array.isArray(data) && data.length > 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error fetching leave records', error);
          this.isReportGenerated = false;
        },
        complete: () => {
          this.spinnerLoader1 = false;
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

  showClearAllButton(): boolean {
  const controls = this.policyAcknowledgementReport.controls;
  return Object.keys(controls).some(key => controls[key].value);
}

  clearAllFilters(): void {
    this.policyAcknowledgementReport.reset();
  }

  navigation(){
    this.router.navigate(['/reports']);
  }

  exportToExcelPolicyAck(): void {
    this.spinnerLoader2 = true;
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'Employee ID',
      employeeName: 'Employee Name',
      workEmail: 'WorkEmail',
      location: 'Location',
      subLocation: 'SubLocation',
      shift: 'Shift',
      source: 'Source',
      acknowledged: 'Acknowledged',
      acknowledgedDate: 'Acknowledged Date',
      policyName: 'Policy Name',
    };

    const NEW_SEQUENCE: string[] = [
      'Employee ID',
      'Employee Name',
      'WorkEmail',
      'Location',
      'SubLocation',
      'Shift',
      'Source',
      'Acknowledged',
      'Acknowledged Date',
      'Policy Name',
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
            const formattedDate = `${date.getDate()} ${date.toLocaleString(
              'default',
              { month: 'short' }
            )} ${date.getFullYear()}`;
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
      fill: { fgColor: { rgb: 'FFFF99' } },
    };
    ws['A1'] = titleCell;

    // Style headers
    NEW_SEQUENCE.forEach((_, idx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: idx });
      const cell = ws[cellAddress] || {};
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F81BD' } },
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
    console.log('Selected Policy:', selectedPolicy);
    const policyName =
      selectedPolicy?.policyName
        ?.replace(/[^a-zA-Z0-9-_ ]/g, '')
        ?.replace(/\s+/g, '_') || 'Policy_Report';
    const fileName = `Policy_Acknowledgement_Report_${policyName}.xlsx`;
    XLSX.writeFile(wb, fileName);
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

  ngOnDestroy(): void {
      if(this.subscription){
        this.subscription.unsubscribe();
      }
  }
}
