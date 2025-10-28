import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { Chip } from "primeng/chip";
import { RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from "primeng/paginator";
import { MultiSelectModule } from 'primeng/multiselect';
import { Subscription } from 'rxjs';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { SkillEmployeePipe } from '../../Pipes/skills.pipe';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-skill-directory-management',
  standalone: true,
  imports: [TabsModule, Chip, RouterModule, Select, DatePicker, CalendarModule, FormsModule, CommonModule, 
    DataLoaderContentComponent, MultiSelectModule, NoDataFoundComponent, SkillEmployeePipe, PaginatorModule],
  templateUrl: './skill-directory-management.component.html',
  styleUrl: './skill-directory-management.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SkillDirectoryManagementComponent {
  filteredTabs: any[] = [];
  imageUrl: string = 'assets/images/profile1.png';
  columnsPerRow = 3;
  navTabs: any[] = [];
  MySkills: any[] = [];
  date!: Date[];
  @ViewChild('datePicker') datePicker: any;
  subscription!: Subscription;
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
  selectedStatus: string = 'All Status';
  selectedMonthRange: boolean = false;
  selectedEmployee: any = null;
  spinnerLoaderforallrecoders = false;
  loader = false;
  searchValue = '';
  empinfo: any = {};
  categoryList: any
  selectedSkills: string[] = [];
  EmpStatus = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Committed', value: 'Committed' },
    { label: 'Available', value: 'Available' }
  ]
  displayLabel!: string;
  multiSkillOptions: any[] = [];

  constructor(private http: HttpService, public formValidation: FormValidationService, 
    private readonly modalService: NgbModal, private openmodalservice: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.selectedStatus = 'All Status';
    this.getEmployeeSkills();
    this.getMultiskills()
    this.navTabs = [
      { label: 'Skills' },
      { label: 'Projects' },
    ];
  }

  onCheckemployeeStatus(statusValue: any) {
    // handle clear case or All Status
    this.selectedStatus = !statusValue || statusValue === 'All Status' ? 'All Status' : statusValue;
    this.getEmployeeSkills();
  }

  onSearch(value: string) {
    this.searchQuery = value.trim();
    this.getEmployeeSkills(); // Trigger search on typing or Enter
  }

  onSkillSelectionChange(): void {
    // When skills change, trigger employee search
    this.getEmployeeSkills();
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

  getActiveSkills(emp: any): any[] {
    if (!emp?.skills?.length) return [];
    return emp.skills.filter((s: any) => s.isActive);
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const normalized = status.toLowerCase();
    if (normalized === 'available') return 'status-available';
    if (normalized === 'committed') return 'status-committed';
    return '';
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
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  getEmployeeSkills(): void {
    const params: any = {
      isActive: true,
      page: this.page,
      pageSize: this.pageSize,
    };
    //  Handle status filters
    if (this.selectedStatus && this.selectedStatus !== 'All Status') {
      params.resourceStatus = this.selectedStatus;
    } else {
      params.resourceStatusList = ['Committed', 'Available'];
    }
    //  Handle search text
    if (this.searchQuery) {
      params.searchQuery = this.searchQuery;
    }
    //  Handle date range
    if (this.monthStartDate && this.monthEndDate) {
      params.fromDate = this.monthStartDate.toISOString();
      params.toDate = this.monthEndDate.toISOString();
    }
    // Handle multi-select skills (comma-separated)
    if (this.selectedSkills && this.selectedSkills.length > 0) {
      params.skillSearch = this.selectedSkills.join(',');
    }
    this.spinnerLoaderforallrecoders = true;
    this.http.getDataIncludeParams('EmployeeSkills/getEmployeeSkills', params).subscribe({
      next: (res: any) => {
        if (res?.success && res?.data?.items?.length) {
          this.MySkills = res.data.items;
          this.totalCount = res.data.totalCount;
        } else {
          this.MySkills = [];
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

  getMultiskills() {
    this.loader = true;
    this.subscription = this.http.getData(`EmployeeSkills/getDistinctEmployeeSkills`).subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.data)) {
          this.multiSkillOptions = response.data.map((skill: any) => ({
            label: skill.skillName, // text shown in dropdown
            value: skill.skillName  // actual value stored
          }));
        } else {
          this.multiSkillOptions = [];
        }
        this.loader = false;
      },
      error: (reason: any) => {
        console.error('Error fetching skills:', reason);
        this.loader = false;
      }
    });
  }

  getCategory() {
    const params = {
      entity: "employee",
      attribute: "skillset"
    }
    this.subscription = this.http.getDataIncludeParams("entityAttributeValues", params).subscribe({
      next: (data: any) => {
        this.categoryList = data;
      }
    })
  }

  closePopup(modal: any) {
    modal.dismiss();
  }

  submitExport() {
    this.spinnerLoaderforallrecoders = true;
    const isActive = true;
    const resourceStatus = !this.selectedStatus || this.selectedStatus === 'All Status' ? '' : this.selectedStatus;
    const searchQuery = this.searchQuery || '';
    const fromDate = this.monthStartDate ? this.monthStartDate.toISOString() : '';
    const toDate = this.monthEndDate ? this.monthEndDate.toISOString() : '';
    this.http.downloadEmployeeSkillsReport('EmployeeSkills/exportEmployeeSkillSet',
      isActive, resourceStatus, searchQuery, fromDate, toDate).subscribe({
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