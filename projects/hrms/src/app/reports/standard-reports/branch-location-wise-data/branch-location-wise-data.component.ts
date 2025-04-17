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
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Branch, EmployeeDetails, IFamilyDetails } from '../../../Interfaces/reports.model';
import { Subject, takeUntil } from 'rxjs';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import * as XLSX from 'xlsx';
import { StandardReportTabsComponent } from '../../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component';

@Component({
  selector: 'app-branch-location-wise-data',
  imports: [
    SelectModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NoDataFoundComponent,
    StandardReportTabsComponent,
    DateformatPipe,
  ],
  templateUrl: './branch-location-wise-data.component.html',
  styleUrl: './branch-location-wise-data.component.scss',
})
export class BranchLocationWiseDataComponent implements OnInit, OnDestroy {
  empStatusList: string[] = ['All Employees', 'Active', 'Inactive'];
  reportForm!: FormGroup;
  familydata = [] as IFamilyDetails[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  standardReportData = [] as EmployeeDetails [];
  branchLocations= [] as Branch [];
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getBranchLocations();
    this.getBranchWiseData();
  }

  initializeForm() {
    this.reportForm = this.fb.group({
      location: ['', Validators.required],
    });
  }

  getBranchWiseData(status?: string) {
    const endpoint = status
      ? `Reports/standardReportsWithoutPagination?EmpStatus=${status}&BranchCode=${'HYDERABAD'}`
      : 'Reports/standardReportsWithoutPagination';
    this.http
      .getData(
        `Reports/standardReportsWithoutPagination?EmployeeStatus=&BranchCode=`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.standardReportData = res.standardReports;
            console.log(this.standardReportData);
            
          }
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {},
      });
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      if (form.value.status === 'All Employees') this.getBranchWiseData();
      else this.getBranchWiseData(form.value.status);
    }
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

  getColumnWidth(data: any[], columnName: string): number {
    // Find the maximum width of data in the column
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);

    // Set minimum width to 10
    return Math.max(10, maxWidth);
  }

  getBranchLocations() {
  this.http.getData('BranchLocation').subscribe({
      next: (res: any) => {
        if (res) {
          this.branchLocations = res;
          if (this.branchLocations.length > 0) {
            this.branchLocations.unshift({
              sno: -1,
              branchCode: 'ALL',
              branchLocation1: 'All Branch Locations',
              isDeleted: false
            });
            this.reportForm.patchValue({
              location: this.branchLocations[0] 
            });
          }
          
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {},
    });
  }

  exportAsExcelFile(): void {
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
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
