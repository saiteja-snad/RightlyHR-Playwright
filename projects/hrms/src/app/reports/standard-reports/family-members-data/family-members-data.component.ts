import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { IFamilyDetails } from '../../../Interfaces/reports.model';
import { filter, Subject, takeUntil } from 'rxjs';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import * as XLSX from 'xlsx';
import { StandardReportTabsComponent } from '../../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-family-members-data',
  imports: [
    SelectModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NoDataFoundComponent,
    StandardReportTabsComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    ModuleInformationComponent,
    NgbPopoverModule
  ],
  templateUrl: './family-members-data.component.html',
  styleUrl: './family-members-data.component.scss',
})
export class FamilyMembersDataComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  empStatusList: string[] = ['All Employees', 'Active', 'Inactive'];
  reportForm!: FormGroup;
  dataload = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  familydata = [] as IFamilyDetails[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    // this.getFamilyDetails();

    this.reportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })

    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initializeForm() {
    this.reportForm = this.fb.group({
      status: ['All Employees', Validators.required],
    });
  }

  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }

  updateModuleInfo() {
    const url = this.router.url;

    const routeToInfoMap: { [key: string]: string } = {
      '/reports/standard-reports/family-data': MODULE_INFOS.STANDARD_REPORTS_FAMILY_MEMBERS_DATA_MODULE_INFO
    };

    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getFamilyDetails(status?: string) {
    this.dataload = true;
    this.spinnerLoader1 = true;

    const queryParams = new URLSearchParams();
    const endpoint = status
      ? `familyMemberDetails/getAllFamilyMembersDetails?EmpStatus=${status}`
      : 'familyMemberDetails/getAllFamilyMembersDetails';
    this.http
      .getData(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.familydata = data as IFamilyDetails[];
        },
        error: (err: any) => {
          this.spinnerLoader1 = false;
          this.dataload = false;
          this.disableBtn = true;
          this.familydata = [];
        },
        complete: () => {
          this.spinnerLoader1 = false;
          this.dataload = false;
          this.disableBtn = false;
        }
      });
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      if (form.value.status === 'All Employees') this.getFamilyDetails();
      else this.getFamilyDetails(form.value.status);
    }
  }

  exportAsExcelFile(): void {
    this.spinnerLoader2 = true;
    // Define header mappings
    const HEADER_MAPPINGS: { [key: string]: string } = {
      employeeId: 'EMPLOYEE ID',
      firstName: 'FIRST NAME',
      middleName: 'MIDDLE NAME',
      lastName: 'LAST NAME',
      workEmail: 'WORK EMAIL',
      empStatus: 'EMPLOYEE STATUS',
      memberName: 'NAME',
      relation: 'RELATION',
      memberDateOfBirth: 'DATE OF BIRTH',
      dependent: 'DEPENDENT',
    };

    // Define new sequence
    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'FIRST NAME',
      'MIDDLE NAME',
      'LAST NAME',
      'WORK EMAIL',
      'EMPLOYEE STATUS',
      'NAME',
      'RELATION',
      'DATE OF BIRTH',
      'DEPENDENT',
    ];

    // Function to format date as 'DD-MMM-YYYY'
    const formatDate = (date: string | Date | undefined) => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const modifiedData = this.familydata.map((record) => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach((columnName) => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(
          (key) => HEADER_MAPPINGS[key] === columnName
        );

        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (
            originalColumnName === 'memberDateOfBirth' &&
            record[originalColumnName]
          ) {
            // Format the date to 'DD-MMM-YYYY'
            modifiedRecord[columnName] = formatDate(record[originalColumnName]);
          } else {
            modifiedRecord[columnName] = (record as any)[originalColumnName];
          }
        } else {
          modifiedRecord[columnName] = '';
        }
      });
      return modifiedRecord;
    });

    // Create worksheet with heading
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ['FAMILY MEMBERS REPORT'], // Add heading
      [], // Empty row for spacing
      [
        'EMPLOYEE ID',
        'FIRST NAME',
        'MIDDLE NAME',
        'LAST NAME',
        'WORK EMAIL',
        'EMPLOYEE STATUS',
        'NAME',
        'RELATION',
        'DATE OF BIRTH',
        'DEPENDENT',
      ], // Headers
    ]);

    // Style for heading
    worksheet['!merges'] = worksheet['!merges'] || [];
    worksheet['!merges'].push({
      s: { r: 0, c: 0 },
      e: { r: 0, c: NEW_SEQUENCE.length - 1 },
    }); // Merge the heading cell

    // Add style to heading
    worksheet['A1'].s = {
      font: {
        bold: true,
        sz: 14, // Font size
        color: { rgb: '000000' }, // Font color (black)
      },
      alignment: {
        horizontal: 'center', // Center align
        vertical: 'center', // Center vertically
      },
    };

    // Set default row height
    worksheet['!rows'] = worksheet['!rows'] || [];
    worksheet['!rows'][0] = { hpt: 20 }; // Set row height for heading row
    worksheet['!rows'][1] = { hpt: 20 }; // Set row height for empty row
    worksheet['!rows'][2] = { hpt: 20 }; // Set row height for header row

    let rowIndex = 3; // Start data rows after the header

    this.familydata.forEach((employee) => {
      const employeeStartRowIndex = rowIndex;

      employee.familyMembers.forEach((member: any, memberIndex: number) => {
        XLSX.utils.sheet_add_aoa(
          worksheet,
          [
            [
              memberIndex === 0 ? employee.employeeId : '',
              memberIndex === 0 ? employee.firstName : '',
              memberIndex === 0 ? employee.middleName : '',
              memberIndex === 0 ? employee.lastName : '',
              memberIndex === 0 ? employee.workEmail : '',
              memberIndex === 0 ? employee.empStatus : '',
              member.memberName,
              member.relation,
              formatDate(member.memberDateOfBirth), // Use the formatted date here
              member.dependent,
            ],
          ],
          { origin: -1 }
        );

        rowIndex++;
      });

      if (employee.familyMembers.length > 1) {
        worksheet['!merges'] = worksheet['!merges'] || [];
        worksheet['!merges'].push(
          {
            s: { r: employeeStartRowIndex, c: 0 },
            e: { r: rowIndex - 1, c: 0 },
          },
          {
            s: { r: employeeStartRowIndex, c: 1 },
            e: { r: rowIndex - 1, c: 1 },
          },
          {
            s: { r: employeeStartRowIndex, c: 2 },
            e: { r: rowIndex - 1, c: 2 },
          },
          {
            s: { r: employeeStartRowIndex, c: 3 },
            e: { r: rowIndex - 1, c: 3 },
          },
          {
            s: { r: employeeStartRowIndex, c: 4 },
            e: { r: rowIndex - 1, c: 4 },
          },
          {
            s: { r: employeeStartRowIndex, c: 5 },
            e: { r: rowIndex - 1, c: 5 },
          }
        );
      }
    });

    // Adjust column width to fit data
    NEW_SEQUENCE.forEach((columnName, index) => {
      let columnWidth = this.getColumnWidth(modifiedData, columnName);
      // Increase the width for specific columns
      if (
        [
          'EMPLOYEE ID',
          'FIRST NAME',
          'MIDDLE NAME',
          'LAST NAME',
          'WORK EMAIL',
          'EMPLOYEE STATUS',
          'NAME',
          'RELATION',
          'DATE OF BIRTH',
          'DEPENDENT',
        ].includes(columnName)
      ) {
        columnWidth += 5; // Increase width by 5
      }
      worksheet['!cols'] = worksheet['!cols'] || [];
      worksheet['!cols'][index] = { wch: columnWidth };
    });

    let { fileName } = this.getFileName('Family_Details_data');
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    this.spinnerLoader2 = false;
    this.modal.openSuccessModal('Family Members data downloaded successfully');
  }

  getFileName(name: string | undefined) {
    let timeSpan = new Date().toISOString();
    let sheetName = name || 'ExportResult';
    let fileName = `${sheetName}-${timeSpan}`;
    return {
      sheetName,
      fileName,
    };
  }
  navigation() {
    this.router.navigate(['/reports']);
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
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
