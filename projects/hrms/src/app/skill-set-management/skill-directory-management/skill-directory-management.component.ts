import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { Chip } from "primeng/chip";
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from "primeng/paginator";
import { MultiSelectModule } from 'primeng/multiselect';
import { filter, Subscription } from 'rxjs';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { MODULE_INFOS } from '../../shared/modules-info';
import moment from 'moment';
import { SkillSetMainTabsComponent } from "../../shared/skill-set/skill-set-main-tabs/skill-set-main-tabs.component";
import { SummaryCard } from '../../Interfaces/skill-dashboard.model';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-skill-directory-management',
  standalone: true,
  imports: [TabsModule, Chip, RouterModule, DatePicker, CalendarModule, FormsModule, CommonModule, ProfileIconComponent,
    DataLoaderContentComponent, MultiSelectModule, NoDataFoundComponent, PaginatorModule, NgbPopoverModule,
    ModuleInformationComponent, TranslateModule, SkillSetMainTabsComponent],
  templateUrl: './skill-directory-management.component.html',
  styleUrl: './skill-directory-management.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SkillDirectoryManagementComponent {
  filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs: any[] = [];
  MySkills: any[] = [];
  imageUrl: any
  date!: Date[];
  summaryCards: SummaryCard[] = [];
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
  isloading: boolean = false;
  componentname: string = '';
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  activeTabIndex = 0;
  selectedSkillName: string = '';
  allEmployees: any[] = [];
  employeeList: any[] = [];
  filteredEmployees: any[] = [];
  employeeSummary: any = {};

  constructor(private http: HttpService, public formValidation: FormValidationService, private sanitizer: DomSanitizer,
    private offcanvasService: NgbOffcanvas, private openmodalservice: OpenModalService, private router: Router) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    if (this.empinfo?.employeeId) {
      this.getEmployeeProfile(this.empinfo.employeeId);
    }
    this.http.profliepicadd$.subscribe(() => {
      if (this.selectedEmployee?.employeeId) {
        this.getEmployeeProfile(this.selectedEmployee.employeeId);
      } else {
        this.getEmployeeProfile(this.empinfo.employeeId);
      }
    });
    this.selectedStatus = 'All Status';
    this.getEmployeeSkills();
    this.getMultiskills()
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.navTabs = [
      { label: 'Skills' },
      { label: 'Projects' },
    ];
    this.getEmployeeDirectorySummary()
  }

  updateModuleInfo() {
    const url = this.router.url;
    this.ComponentnameDisplay();
    this.routeToInfoMap = {
      'skill-management/directory': MODULE_INFOS.SKILLSET_MANAGEMENT_DIRECTORY_MODULE_INFO,
    };
    const matchedEntry = Object.entries(this.routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  ComponentnameDisplay() {
    if (this.router.url === '/skill-management/directory') {
      this.componentname = 'Directory';
    }
  }

  onSearch() {
    this.page = 1;
    this.getEmployeeSkills();
  }
  private searchTimer: any;
  
  onSearch1(): void {
  clearTimeout(this.searchTimer);
  this.searchTimer = setTimeout(() => {
    this.getEmployeeDirectorySummary();
  }, 400); 
}
  onSkillSelectionChange(): void {
    this.getEmployeeSkills();
  }

  onDateChange(dates: Date[]) {
    if (!dates || dates.length === 0) {
      this.selectedMonthRange = false;
      this.monthStartDate = this.monthEndDate = undefined!;
      return;
    }
    if (dates.length === 1) {
      this.monthStartDate = dates[0];
      this.monthEndDate = undefined!;
      this.selectedMonthRange = false;
      return;
    }
    if (dates.length === 2) {
      this.monthStartDate = dates[0];
      this.monthEndDate = dates[1];
      this.selectedMonthRange = true;
      this.getEmployeeSkills();
    }
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageSize = event.rows;
    this.page = Math.floor(this.first / this.rows) + 1;
    this.getEmployeeSkills();
  }

  onPageSizeChange(pageSize: number) {
    this.rows = pageSize;
    this.pageSize = pageSize;
    this.first = 0;
    this.page = 1;
    this.getEmployeeSkills();
  }

  getActiveSkills(emp: any): any[] {
    if (!emp?.skills?.length) return [];
    return emp.skills.filter((s: any) => s.isActive);
  }

  get employeeStatusDisplay(): string {
    const emp = this.selectedEmployee;
    if (!emp) return '-';
    if (emp.employeeProjectStatus === 'Committed' && emp.projects?.length) {
      const lastProject = emp.projects
        .filter((p: any) => p.endDate)
        .sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
      if (lastProject?.endDate) {
        const formattedDate = moment(lastProject.endDate).format('MMM DD, YYYY');
        return `Committed until ${formattedDate}`;
      }
    }
    return emp.employeeProjectStatus || '-';
  }

  getProficiencyClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'chip-beginner';
      case 'intermediate': return 'chip-intermediate';
      case 'expert': return 'chip-expert';
      default: return 'chip-default';
    }
  }

  openOffcanvas(content: TemplateRef<any>, emp: any) {
    this.selectedEmployee = { ...emp };
    const employeeId = emp?.employee?.employeeId;
    if (employeeId) this.getEmployeeProfile(employeeId);

    const allSkills = emp.skills || [];
    this.selectedEmployee.techSkills = allSkills.filter(
      (s: any) => s.isActive && s.skillCategory.toLowerCase().includes('technical')
    );
    this.selectedEmployee.softSkills = allSkills.filter(
      (s: any) => s.isActive && s.skillCategory.toLowerCase().includes('soft')
    );

    this.offcanvasService.open(content, {
      position: 'end',
      scroll: true,
      backdrop: true,
      panelClass: 'employee-offcanvas'
    });
  }

  close(modal: any) {
    modal.close();
  }

  getSkillsByLevel(level: string, skills: any[]) {
    return skills.filter(s => s.proficiencyLevel?.toLowerCase() === level.toLowerCase());
  }

  getEmployeeProfile(employeeId: number) {
    this.isloading = true;
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.isloading = false;
        if (data?.profileUrl) {
          this.downloadEmployeeProfilePic(data.profileUrl);
        } else {
          this.imageUrl = null;
        }
      },
      error: (reason) => {
        this.isloading = false;
        console.error('Error fetching employee data:', reason);
      },
    });
  }

  downloadEmployeeProfilePic(profileUrl: string) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', profileUrl).subscribe({
      next: (res: any) => {
        const blob = new Blob([res['body']], { type: 'image/png' });
        const objectURL = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (reason) => console.error('Error downloading image:', reason),
    });
  }

  getEmployeeSkills(): void {
    const params: any = {
      isActive: true,
      page: this.page,
      pageSize: this.pageSize,
    };
    if (this.selectedStatus && this.selectedStatus !== 'All Status') {
      params.resourceStatus = this.selectedStatus;
    }
    if (this.selectedSkills?.length > 0) {
      params.skillSearch = this.selectedSkills.join(',');
    }
    if (this.monthStartDate && this.monthEndDate) {
      params.fromDate = this.monthStartDate.toISOString();
      params.toDate = this.monthEndDate.toISOString();
    }
    if (this.searchQuery?.trim()) {
      params.searchQuery = this.searchQuery.trim();
    }
    this.spinnerLoaderforallrecoders = true;
    this.http.getDataIncludeParams('EmployeeSkills/getEmployeeSkills', params).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res?.data?.items)) {
          this.MySkills = res.data.items;
          this.totalCount = res.data.totalCount || this.MySkills.length;
        } else {
          this.MySkills = [];
          this.totalCount = 0;
        }
      },
      error: (err) => {
        console.error('Error fetching employee skills:', err);
        this.MySkills = [];
        this.totalCount = 0;
        this.spinnerLoaderforallrecoders = false;
      },
      complete: () => {
        this.spinnerLoaderforallrecoders = false;
      },
    });
  }

  getMultiskills() {
    this.loader = true;
    this.subscription = this.http.getData(`EmployeeSkills/getDistinctEmployeeSkills`).subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.data)) {
          this.multiSkillOptions = response.data.map((skill: any) => ({
            label: skill.skillName,
            value: skill.skillName
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
    const skillSearch = this.selectedSkills?.length ? this.selectedSkills.join(',') : '';
    const fromDate = this.monthStartDate ? this.monthStartDate.toISOString() : '';
    const toDate = this.monthEndDate ? this.monthEndDate.toISOString() : '';
    this.http.downloadEmployeeSkillsReport('EmployeeSkills/exportEmployeeSkillSet',
      isActive, resourceStatus, searchQuery, fromDate, toDate, skillSearch).subscribe({
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
 getEmployeeDirectorySummary(): void {
  const params: any = {};

  //  Send search text to backend
  if (this.searchQuery?.trim()) {
    params.searchQuery = this.searchQuery.trim();
  }

  this.isloading = true;

  this.subscription = this.http
    .getDataIncludeParams('EmployeeSkills/getEmployeeDirectorySummary', params)
    .subscribe({
      next: (res: any) => {
        this.isloading = false;

        if (res?.data) {
          this.employeeSummary = res.data;

          this.allEmployees = (this.employeeSummary.allEmployeesList ?? []).map((emp: any) => ({
            ...emp,
            profileImage: this.getImageUrl(emp.profileImage),
          }));

          this.summaryCards = [
            {
              title: 'Total Resources',
              key: 'totalEmployees',
              value: this.employeeSummary.totalEmployees ?? 0,
              icons: './icons/Total Employee Count.png',
            },
            {
              title: 'Updated Resources',
              key: 'skilledEmployees',
              value: this.employeeSummary.skilledEmployees ?? 0,
              icons: './icons/Available Employees Count.png',
            },
            {
              title: 'Resources Not yet Updated',
              key: 'unSkilledEmployees',
              value: this.employeeSummary.unSkilledEmployees ?? 0,
              icons: './icons/Not Updated.png',
            },
          ];
        } else {
          this.employeeSummary = {};
          this.allEmployees = [];
          this.summaryCards = [];
        }
      },
      error: (reason) => {
        this.isloading = false;
        console.error('Error fetching employee directory summary:', reason);
      },
    });
}




  private getImageUrl(imagePath: string): string | null {
    if (!imagePath) return null;

    const lowerPath = imagePath.toLowerCase();

    if (imagePath.startsWith('http')) {
      return imagePath;
    }


    if (lowerPath.startsWith('profilepics/')) {
      return `${environment.viewUrl.replace(/\/$/, '')}/${imagePath}`;
    }

    // Fallback for other paths
    return `${environment.ApiUrl.replace(/\/$/, '')}/EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }


  openEnd2(content: TemplateRef<any>, card: any): void {
    this.isloading = true;
    this.selectedSkillName = card.title;

    let list: any[] = [];

    switch (card.key) {
      case 'totalEmployees':
        list = this.employeeSummary.allEmployeesList || [];
        break;
      case 'skilledEmployees':
        list = this.employeeSummary.skilledEmployeesList || [];
        break;
      case 'unSkilledEmployees':
        list = this.employeeSummary.unSkilledEmployeesList || [];
        break;
      default:
        list = [];
    }


    this.employeeList = list.map(emp => ({
      ...emp,
      profileImage: emp.profileImage ? this.getImageUrl(emp.profileImage) : null
    }));

    this.isloading = false;
    this.offcanvasService.open(content, { position: 'end' });
  }




  clearAllFilters(): void {
    this.selectedStatus = 'All Status';
    this.selectedSkills = [];
    this.searchQuery = '';
    this.displayLabel = '';
    this.date = [];
    this.page = 1;
    this.first = 0;
    this.getEmployeeSkills();
  }
}