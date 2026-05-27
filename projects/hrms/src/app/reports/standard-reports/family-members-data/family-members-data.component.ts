import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { IFamilyDetails } from '../../../Interfaces/reports.model';
import { Subject, takeUntil } from 'rxjs';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import * as XLSX from 'xlsx-js-style';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-family-members-data',
  imports: [
    SelectModule,
    MultiSelectModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    ReportsHeaderComponent,
    TranslateModule
],
  templateUrl: './family-members-data.component.html',
  styleUrl: './family-members-data.component.scss',
})

export class FamilyMembersDataComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  employeeStatusOptions = [
    { label: 'All Employees', value: 'All' },
    { label: 'Active', value: 'Active,Trainee Active,Active Contract' },
    { label: 'Inactive', value: 'Inactive,Trainee Inactive,Inactive Contract' }
  ];
  reportForm!: FormGroup;
  dataload = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  familydata = [] as IFamilyDetails[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.handleEmployeeStatusChanges();

    this.reportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  initializeForm() {
    this.reportForm = this.fb.group({
      status: [['All']],
    });
  }

  handleEmployeeStatusChanges(): void {
    this.reportForm.get('status')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((selected: string[]) => {
      if (!selected || selected.length === 0) return;

      if (selected.length > 1) {
        const lastSelected = selected[selected.length - 1];
        if (lastSelected === 'All') {
          setTimeout(() => this.reportForm.get('status')?.setValue(['All'], { emitEvent: false }));
        } else if (selected.includes('All')) {
          setTimeout(() => this.reportForm.get('status')?.setValue(selected.filter(s => s !== 'All'), { emitEvent: false }));
        }
      }
    });
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
          this.closeCanvas();
        },
        complete: () => {
          this.spinnerLoader1 = false;
          this.dataload = false;
          this.disableBtn = false;
          this.closeCanvas();
        }
      });
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      this.isFilterIndicatorActive = this.isFilterApplied();
      const selected: string[] = form.value.status || [];
      const isAllEmployees = selected.length === 0 || selected.includes('All');

      if (isAllEmployees) {
        this.getFamilyDetails();
      } else {
        const statusParam = selected.join(',');
        this.getFamilyDetails(statusParam);
      }
    }
  }

  isFilterApplied(): boolean {
    const { status } = this.reportForm.value;
    return status && status.length > 0 && !status.includes('All');
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  clearAllFilters(): void {
    this.reportForm.reset();
    this.reportForm.patchValue({
      status: ['All'],
    });
    this.disableBtn = false;
    this.isFilterIndicatorActive = false;
    this.familydata = [];
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  exportAsExcelFile(): void {
    this.spinnerLoader2 = true;
    setTimeout(() => {
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

      // Function to format date based on environment configuration
      const datePipe = new DatePipe('en-US');
      const formatDate = (date: string | Date | undefined) => {
        if (!date) return '';
        return datePipe.transform(date, environment.dateformat) || '';
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
          horizontal: 'left', // Left align
          vertical: 'center', // Center vertically
        },
      };

      // Add style to headers (Row 1)
      for (let C = 0; C < NEW_SEQUENCE.length; ++C) {
        let cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = { font: { bold: true } };
        }
      }

      // Set default row height
      worksheet['!rows'] = worksheet['!rows'] || [];
      worksheet['!rows'][0] = { hpt: 20 }; // Set row height for heading row
      worksheet['!rows'][1] = { hpt: 20 }; // Set row height for header row

      let rowIndex = 2; // Start data rows after the header

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

      let { fileName } = this.getFileName('Family_Details_Report');
      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ['data'],
      };
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      this.spinnerLoader2 = false;
      this.modal.openSuccessModal('Family Details Report exported successfully',);
    }, 100);
  }

  getFileName(name: string | undefined) {
    let timeSpan = dayjs().format('MMM DD YYYY');
    let sheetName = name || 'ExportResult';
    let fileName = `${sheetName.replace(/_/g, ' ')} - ${timeSpan}`;
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
