import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { TableModule, Table } from 'primeng/table';

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
    TranslateModule,
    TableModule
],
  templateUrl: './family-members-data.component.html',
  styleUrl: './family-members-data.component.scss',
})

export class FamilyMembersDataComponent implements OnInit, OnDestroy {
  @ViewChild('familyTable') familyTable!: Table;
  sortedData: IFamilyDetails[] = [];
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
  originalFamilydata: IFamilyDetails[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;

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
          this.originalFamilydata = [...this.familydata];
          this.currentSortField = '';
          this.currentSortOrder = 0;
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
      const sortedData: IFamilyDetails[] = this.sortedData.length ? this.sortedData : (this.familyTable?.filteredValue ?? this.familydata);
      const datePipe = new DatePipe('en-US');
      const formatDate = (date: string | Date | undefined) => {
        if (!date) return '-';
        return datePipe.transform(date, environment.dateformat) || '-';
      };

      const normalizeCell = (value: any) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length > 0 ? trimmed : '-';
        }
        return value;
      };

      const headers = [
        'EMPLOYEE ID', 'FIRST NAME', 'MIDDLE NAME', 'LAST NAME',
        'WORK EMAIL', 'EMPLOYEE STATUS', 'NAME', 'RELATION', 'DATE OF BIRTH', 'DEPENDENT'
      ];

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
        ['FAMILY MEMBERS REPORT'],
        headers
      ]);

      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
      worksheet['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'left', vertical: 'center' } };

      for (let C = 0; C < headers.length; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
        if (worksheet[cellAddress]) worksheet[cellAddress].s = { font: { bold: true } };
      }

      worksheet['!rows'] = [{ hpt: 20 }, { hpt: 20 }];

      let rowIndex = 2;

      sortedData.forEach((employee) => {
        const members = employee.familyMembers?.length ? employee.familyMembers : [null];
        const employeeStartRowIndex = rowIndex;

        members.forEach((member: any, memberIndex: number) => {
          XLSX.utils.sheet_add_aoa(worksheet, [[
            memberIndex === 0 ? normalizeCell(employee.employeeId) : '',
            memberIndex === 0 ? normalizeCell(employee.firstName) : '',
            memberIndex === 0 ? normalizeCell(employee.middleName) : '',
            memberIndex === 0 ? normalizeCell(employee.lastName) : '',
            memberIndex === 0 ? normalizeCell(employee.workEmail) : '',
            memberIndex === 0 ? normalizeCell(employee.empStatus) : '',
            member ? normalizeCell(member.memberName) : '-',
            member ? normalizeCell(member.relation) : '-',
            member ? formatDate(member.memberDateOfBirth) : '-',
            member ? normalizeCell(member.dependent) : '-',
          ]], { origin: -1 });
          rowIndex++;
        });

        if (members.length > 1) {
          for (let c = 0; c <= 5; c++) {
            worksheet['!merges']!.push({
              s: { r: employeeStartRowIndex, c },
              e: { r: rowIndex - 1, c }
            });
          }
        }
      });

      worksheet['!cols'] = headers.map(() => ({ wch: 20 }));

      let { fileName } = this.getFileName('Family Details Report');
      const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      this.spinnerLoader2 = false;
      this.modal.openSuccessModal('Family Details Report exported successfully');
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
  onSortChange(event: any): void {
    this.sortedData = this.familyTable?.filteredValue ?? this.familyTable?.value ?? this.familydata;
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
customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.familydata = [...this.originalFamilydata];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.familyTable) this.familyTable.reset();
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

      if (field === 'fusionEmpId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
