import { Component, computed, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Chip } from "primeng/chip";
import { RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { MySkills } from '../../../../Interfaces/myskill.model';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { SkillEmployeePipe } from "../../../../Pipes/skills.pipe";
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { PaginatorModule } from "primeng/paginator";


@Component({
  selector: 'app-skill-directory-management',
  standalone: true,
  imports: [
    TabsModule, Chip, RouterModule, Select, DatePicker, CalendarModule, FormsModule, CommonModule, DataLoaderContentComponent,
    NoDataFoundComponent,
    SkillEmployeePipe,
    PaginatorModule
  ],
  templateUrl: './skill-directory-management.component.html',
  styleUrl: './skill-directory-management.component.scss'
})
export class SkillDirectoryManagementComponent {
  filteredTabs: any[] = [];
  imageUrl: string = 'assets/images/profile1.png';
  columnsPerRow = 3;
  navTabs: any[] = [];
  MySkills: any[] = [];
  date!: Date[];
  @ViewChild('datePicker') datePicker: any;
  private start!: Date;
  private end!: Date;
  monthStartDate!: Date;
  page = 1;
  pageSize = 10;
  rows = 10;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  searchQuery: string = '';
  totalCount!: number;
  monthEndDate!: Date;
  selectedStatus: string | null = null;
  selectedMonthRange: boolean = false;
  selectedEmployee: any = null;
  spinnerLoaderforallrecoders = false;
  loader = false;
  searchValue = '';
  empinfo: any = {};
  EmpStatus = [
    { label: 'Committed', value: 'Committed' },
    { label: 'Available', value: 'Available' }
  ]
  displayLabel!: string;
  constructor(
    private http: HttpService,
    public formValidation: FormValidationService,
    private readonly modalService: NgbModal,
    private openmodalservice: OpenModalService,
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getEmployeeSkills();
    this.navTabs = [
      { label: 'Skills' },
      { label: 'Projects' },
    ];
  }
  onCheckemployeeStatus(statusValue: any) {
    this.selectedStatus = statusValue || null;
    this.getEmployeeSkills(); // Refresh on status change
  }

  onSearch(value: string) {
    this.searchQuery = value.trim();
    this.getEmployeeSkills(); // Trigger search on typing or Enter
  }

  onDateChange(dates: Date[]) {
    // Reset
    if (!dates || dates.length === 0) {
      this.selectedMonthRange = false;
      this.monthStartDate = this.monthEndDate = undefined!;
      return;
    }

    // User picked start only
    if (dates.length === 1) {
      this.monthStartDate = dates[0];
      this.monthEndDate = undefined!;
      this.selectedMonthRange = false;
      return; // don’t call API yet
    }

    // User picked both start and end
    if (dates.length === 2) {
      this.monthStartDate = dates[0];
      this.monthEndDate = dates[1];
      this.selectedMonthRange = true;

      // Trigger API
      this.getEmployeeSkills();
    }
  }

   onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    const currentPage = Math.floor(this.first / this.rows) + 1;
    this.page = currentPage;
    this.getEmployeeSkills();
  }

  onPageSizeChange(pageSize: number) {
    this.rows = pageSize;
    this.first = 0;
    this.page = 1;
    this.getEmployeeSkills();
  }
  getSkillList(emp: any): string {
    if (!emp?.skills?.length) return '-';

    return emp.skills
      .filter((s: any) => s.isActive)
      .map((s: any) => `${s.skillName} (${s.proficiencyLevel})`)
      .join(', ') || '-';
  }

  openModal(content: any, emp: any) {
    // Clone the selected employee object
    this.selectedEmployee = { ...emp };

    // Split skills into categories for modal display
    const allSkills = emp.skills || [];
    this.selectedEmployee.techSkills = allSkills.filter(
      (s: any) => s.isActive && s.skillCategory.toLowerCase().includes('technical')
    );
    this.selectedEmployee.softSkills = allSkills.filter(
      (s: any) => s.isActive && s.skillCategory.toLowerCase().includes('soft')
    );

    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  getEmployeeSkills(): void {
    const params: any = {
      isActive: true,
      page: this.page,
      pageSize: this.pageSize,
    };

    if (this.selectedStatus) params.resourceStatus = this.selectedStatus;
    if (this.searchQuery) params.searchQuery = this.searchQuery;
    if (this.monthStartDate && this.monthEndDate) {
      params.fromDate = this.monthStartDate.toISOString();
      params.toDate = this.monthEndDate.toISOString();
    }

    this.spinnerLoaderforallrecoders = true;

    this.http.getDataIncludeParams('EmployeeSkills/getEmployeeSkills', params)
      .subscribe({
        next: (res: any) => {
          if (res?.success && res?.data?.items?.length) {
            this.MySkills = res.data.items;
            this.totalCount = res.data.totalCount;
          } else {
            this.MySkills = []; // clear old data
            this.totalCount = 0;
          }
        },
        error: (err) => {
          console.error('Error fetching employee skills:', err);
          this.MySkills = [];
        },
        complete: () => {
          this.spinnerLoaderforallrecoders = false;
        }
      });
  }


  closePopup(modal: any) {
    modal.dismiss();
  }
  isSubmitDisabled(): boolean {
    return !(this.selectedStatus && this.monthStartDate && this.monthEndDate);
  }

  submitExport() {
    this.spinnerLoaderforallrecoders = true;
    const isActive = true;
    const resourceStatus = this.selectedStatus || '';
    const searchQuery = this.searchQuery || '';
    const fromDate = this.monthStartDate ? this.monthStartDate.toISOString() : '';
    const toDate = this.monthEndDate ? this.monthEndDate.toISOString() : '';

    this.http.downloadEmployeeSkillsReport('EmployeeSkills/exportEmployeeSkillSet',
      isActive,
      resourceStatus,
      searchQuery,
      fromDate,
      toDate
    ).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Employee_Skill_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();

        this.openmodalservice.openSuccessModal('Employee Skill Report Generated Successfully');
      },
      error: () => {
        this.spinnerLoaderforallrecoders = false;
        this.openmodalservice.openErrorModal('No records found for the selected filters');
      },
      complete: () => {
        this.spinnerLoaderforallrecoders = false;
      },
    });
  }


}
