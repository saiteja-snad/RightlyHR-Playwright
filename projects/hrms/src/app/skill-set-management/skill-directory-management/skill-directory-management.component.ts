import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
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
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-skill-directory-management',
  standalone: true,
  imports: [TabsModule, Chip, RouterModule, DatePicker, CalendarModule, FormsModule, CommonModule, ProfileIconComponent, SkeletonModule,
    DataLoaderContentComponent, MultiSelectModule, NoDataFoundComponent, PaginatorModule, NgbPopoverModule, ModuleInformationComponent,
    ModuleInfoIconComponent, TranslateModule, SkillSetMainTabsComponent, TableModule],
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
  totalRecords = 0;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  searchQuery: string = '';
  resourceSearchQuery: string = '';
  currentSortField = '';
  currentSortOrder = 0;
  currentUIField = '';
  @ViewChild('skillDirectoryTable') skillDirectoryTable!: Table;
  totalCount!: number;
  monthEndDate!: Date;
  selectedStatus: string = 'All Status';
  selectedMonthRange: boolean = false;
  selectedEmployee: any = null;
  spinnerLoaderforallrecoders = false;
  spinnerLoaderforallrecodersforbutton = false;
  loader = false;
  searchValue = '';
  empinfo: any = {};
  categoryList: any
  selectedSkills: string[] = [];
  selectedDepartment: string[] = [];
  selectedProjects: string[] = [];
  EmpStatus = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Committed', value: 'Committed' },
    { label: 'Available', value: 'Available' }
  ]

  displayLabel!: string;
  multiSkillOptions: any[] = [];
  departmentOptions: any[] = [];
  projectOptions: any[] = [];
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
  selectedSkillKey: string = ''
  noDataFound = false;
  chartLoader = false;
  selectedProject: any = null;
  selectedPhases: any[] = [];

  constructor(private http: HttpService, public formValidation: FormValidationService, private sanitizer: DomSanitizer, private modalService: NgbModal,
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
    this.getDepartments()
    this.getProjects();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.navTabs = [
      { label: 'Skills' },
      { label: 'Projects' },
    ];
    this.getEmployeedirectoryCount()
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
      backdrop: 'static',
      panelClass: 'employee-offcanvas'
    });
  }

  close(modal: any) {
    modal.close();
 
    this.resourceSearchQuery = ''
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
  // Category-specific icons
  private categoryIcons: Record<string, string> = {
    technicalskill: "/icons/technical-skills-icon.png",
    softskill: "/icons/soft-skills-icon.png",
    leadershipskill: "/icons/leadership-skills.png",
    functionalskill: "/icons/functional-skills.png"
  };

  // Default fallback icon rotation
  private fallbackIconPool: string[] = [
    "/icons/intelligence.png",
    "/icons/logical-thinking.png",
    "/icons/technique.png"
  ];
  private usedFallbackIcons = new Set<string>();
  skillCategories: any[] = [];
  getEmployeeSkills(): void {
    this.isloading = true;
    this.noDataFound = false;
    this.spinnerLoaderforallrecoders = true;

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
    if (this.selectedDepartment?.length > 0) {
      params.departmentIds = this.selectedDepartment.join(',');
    }
    if (this.selectedProjects?.length > 0) {
      params.projectIds = this.selectedProjects.join(',');
    }
    if (this.searchQuery?.trim()) {
      params.searchQuery = this.searchQuery.trim();
    }

    const sortBy = this.currentSortField && this.currentSortOrder !== 0 ? this.currentSortField : undefined;
    const sortOrder = this.currentSortOrder === 1 ? 'asc' : this.currentSortOrder === -1 ? 'desc' : undefined;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    this.http.getDataIncludeParams('EmployeeSkills/getEmployeeSkills', params).subscribe({
      next: (res: any) => {
        this.isloading = false;
        this.spinnerLoaderforallrecoders = false;
        if (res?.success && Array.isArray(res?.data?.items) && res.data.items.length > 0) {
          this.MySkills = res.data.items.map((emp: any) => {
            emp.projects = emp.projects?.map((project: any) => ({
              ...project,
              phasesCount: project?.phases?.length || 0
            })) || [];
            const grouped: any = {};
            const skills = emp.skills || [];
            skills.forEach((skill: { isActive: any; skillCategory: string; }) => {
              if (!skill.isActive) return;
              const category = skill.skillCategory?.trim() || "Others";
              if (!grouped[category]) grouped[category] = [];
              grouped[category].push(skill);
            });
            emp.skillCategories = Object.keys(grouped).map(category => ({
              category,
              icon: this.getCategoryIcon(category),
              skills: grouped[category]
            }));
            return emp;
          });

          this.totalCount = res.data.totalCount || this.MySkills.length;
          this.noDataFound = false;

        } else {
          this.MySkills = [];
          this.totalCount = 0;
          this.noDataFound = true;
        }
      },
      error: (err) => {
        console.error('Error fetching employee skills:', err);
        this.isloading = false;
        this.spinnerLoaderforallrecoders = false;
        this.MySkills = [];
        this.totalCount = 0;
        this.noDataFound = true;
      },
    });
  }
  private normalizeCategory(key: string): string {
    return key.replace(/\s+/g, '').toLowerCase();
  }
  private categoryAliases: Record<string, string> = {
    technicalskill: "technicalskill",
    technicalskills: "technicalskill",

    softskill: "softskill",
    softskills: "softskill",

    leadershipskill: "leadershipskill",
    leadershipskills: "leadershipskill",

    functionalskill: "functionalskill",
    functionalskills: "functionalskill"
  };
  private fallbackMap: Record<string, string> = {};
  getCategoryIcon(category: string): string {
    // Normalize
    let normalized = this.normalizeCategory(category || "");
    normalized = this.categoryAliases[normalized] || normalized;

    // If category has known icon
    if (this.categoryIcons[normalized]) {
      return this.categoryIcons[normalized];
    }

    // If fallback icon already assigned for this unknown category → reuse it
    if (this.fallbackMap[normalized]) {
      return this.fallbackMap[normalized];
    }

    // Assign next available fallback icon uniquely
    for (const icon of this.fallbackIconPool) {
      const alreadyUsed = Object.values(this.fallbackMap).includes(icon);
      if (!alreadyUsed) {
        this.fallbackMap[normalized] = icon;
        return icon;
      }
    }

    // If all fallback icons are used, start cycling
    const cycleIndex = Object.keys(this.fallbackMap).length % this.fallbackIconPool.length;
    const fallback = this.fallbackIconPool[cycleIndex];

    this.fallbackMap[normalized] = fallback;
    return fallback;
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

  getDepartments() {
    this.subscription = this.http.getData("Department").subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
        this.departmentOptions = list.map((d: any) => ({
          label: d.departmentName,
          value: d.sno
        }));
      }
    });
  }

  getProjects() {
    this.subscription = this.http.getData("Project").subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
        this.projectOptions = list.map((d: any) => ({
          label: d.projectName,
          value: d.projectId
        }));
      }
    });
  }

  getCategory() {
    const params = {
      entity: "employee",
      attribute: "Skill Category"
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
    // this.spinnerLoaderforallrecoders = true;
    const isActive = true;
    const resourceStatus = !this.selectedStatus || this.selectedStatus === 'All Status' ? '' : this.selectedStatus;
    const searchQuery = this.searchQuery || '';
    const skillSearch = this.selectedSkills?.length ? this.selectedSkills.join(',') : '';
    const fromDate = this.monthStartDate ? this.monthStartDate.toISOString() : '';
    const toDate = this.monthEndDate ? this.monthEndDate.toISOString() : '';
    const departmentIds = this.selectedDepartment?.length ? this.selectedDepartment.join(',') : '';
    const projectIds = this.selectedProjects?.length ? this.selectedProjects.join(',') : '';

    this.http.downloadEmployeeSkillsReport('EmployeeSkills/exportEmployeeSkillSet',
      isActive, resourceStatus, searchQuery, fromDate, toDate, skillSearch, departmentIds, projectIds).subscribe({
        next: (response: any) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Employee_Skill_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
          link.click();
          this.openmodalservice.openSuccessModal('Employee Skill Report Exported Successfully');
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
  getEmployeeDirectorySummary(callback?: () => void): void {
    const params: any = {};
    if (this.resourceSearchQuery?.trim()) {
      params.searchQuery = this.resourceSearchQuery.trim();
    }
    this.isloading = true;
    this.http.getDataIncludeParams('EmployeeSkills/getEmployeeDirectorySummary', params).subscribe({
      next: (res: any) => {
        this.isloading = false;

        if (res?.success && res.data) {
          const summary = res.data;
          // Helper to add proper image URLs
          const addProfileImage = (list: any[] = []) => {
            return list.map(emp => {
              const profilePath = emp.profileImage || emp.profileUrl || '';
              return {
                ...emp,
                profileImage: 'images/alternate.png', // default placeholder
                originalProfileUrl: profilePath
              };
            });
          };

          // Store employee summary with categorized lists
          this.employeeSummary = {
            allEmployeesList: addProfileImage(summary.allEmployeesList || []),
            skilledEmployeesList: addProfileImage(summary.skilledEmployeesList || []),
            unSkilledEmployeesList: addProfileImage(summary.unSkilledEmployeesList || []),
            totalEmployees: summary.totalEmployees ?? 0,
            skilledEmployees: summary.skilledEmployees ?? 0,
            unSkilledEmployees: summary.unSkilledEmployees ?? 0
          };
          // Step 2: After assigning employeeSummary
          ['allEmployeesList', 'skilledEmployeesList', 'unSkilledEmployeesList'].forEach(listKey => {
            const list = this.employeeSummary[listKey];
            if (Array.isArray(list)) {
              list.forEach(emp => {
                if (emp.originalProfileUrl) {
                  this.downloadAndSetProfileImage(emp, listKey);
                }
              });
            }
          });

          // Assign the proper list based on selected key
          switch (this.selectedSkillKey) {
            case 'totalEmployees':
              this.employeeList = this.employeeSummary.allEmployeesList;
              break;
            case 'skilledEmployees':
              this.employeeList = this.employeeSummary.skilledEmployeesList;
              break;
            case 'unSkilledEmployees':
              this.employeeList = this.employeeSummary.unSkilledEmployeesList;
              break;
            default:
              this.employeeList = this.employeeSummary.allEmployeesList;
          }
        } else {
          this.resetEmployeeSummaryData();
        }
        if (callback) callback();
      },
      error: (err) => {
        this.isloading = false;
        console.error('Error fetching employee directory summary:', err);
        this.resetEmployeeSummaryData();
        if (callback) callback();
      }
    });
  }
  downloadAndSetProfileImage(emp: any, listKey: string): void {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', emp.originalProfileUrl).subscribe({
      next: (res: any) => {
        const blob = new Blob([res['body']], { type: 'image/png' });
        const objectURL = URL.createObjectURL(blob);
        emp.profileImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: () => {
        emp.profileImage = 'images/alternate.png';
        console.warn(`Failed to download profile image for ${emp.employeeId || 'unknown'}`);
      }
    });
  }

  getEmployeedirectoryCount(): void {
    this.subscription = this.http.getData('EmployeeSkills/getEmployeeDirectorySummaryCount').subscribe({
      next: (res: any) => {
        this.chartLoader = true;
        if (res?.data) {
          const summary = res.data;
          this.summaryCards = [
            {
              key: 'totalEmployees',
              title: 'Total Resources',
              value: summary.totalEmployees ?? 0,
              icons: './icons/Total Employee Count.png',
            },
            {
              key: 'skilledEmployees',
              title: 'Resources with Updated Skills',
              value: summary.skilledEmployees ?? 0,
              icons: './icons/Available Employees Count.png',
            },
            {
              key: 'unSkilledEmployees',
              title: 'Skill Updates Pending',
              value: summary.unSkilledEmployees ?? 0,
              icons: './icons/Not Updated.png',
            }
          ];
        }
      },
      error: (err) => {
        this.isloading = false;
        this.chartLoader = false;
        console.error('Error fetching employee directory summary count:', err);
      }
    });
  }

  resetEmployeeSummaryData(): void {
    this.employeeSummary = {};
    this.allEmployees = [];
    this.summaryCards = [];
  }

  openEnd2(content: TemplateRef<any>, card: any): void {
    this.selectedSkillName = card.title;
    this.selectedSkillKey = card.key;
    this.isloading = true;

    this.getEmployeeDirectorySummary(() => {
      this.isloading = false;
      this.offcanvasService.open(content, {
        position: 'end',
        backdrop: 'static',
        keyboard: false
      });
    });
  }

  clearAllFilters(): void {
    const isFilterApplied =
      (this.selectedStatus && this.selectedStatus !== 'All Status') ||
      (this.selectedSkills && this.selectedSkills.length > 0) || (this.selectedProjects && this.selectedProjects.length > 0) ||
      (this.resourceSearchQuery && this.resourceSearchQuery.trim() !== '') || (this.selectedDepartment && this.selectedDepartment.length > 0) ||
      (this.searchQuery && this.searchQuery.trim() !== '') ||
      (this.displayLabel && this.displayLabel.trim() !== '') ||
      (this.date && this.date.length > 0);
    if (isFilterApplied) {
      this.selectedStatus = 'All Status';
      this.selectedSkills = [];
      this.resourceSearchQuery = '';
      this.searchQuery = '';
      this.displayLabel = '';
      this.selectedDepartment = [];
      this.selectedProjects = [];
      this.date = [];
      this.page = 1;
      this.first = 0;
      this.getEmployeeSkills();
    } else {
      this.selectedStatus = 'All Status';
      this.selectedSkills = [];
      this.resourceSearchQuery = '';
      this.searchQuery = '';
      this.selectedDepartment = [];
      this.selectedProjects = [];
      this.displayLabel = '';
      this.date = [];
      this.page = 1;
      this.first = 0;

    }
  }

  isAnyFilterApplied(): boolean {
    return (
      (this.selectedStatus && this.selectedStatus !== 'All Status') ||
      (this.selectedSkills && this.selectedSkills.length > 0) ||
      (this.selectedDepartment && this.selectedDepartment.length > 0) ||
      (this.selectedProjects && this.selectedProjects.length > 0) ||
      (this.resourceSearchQuery && this.resourceSearchQuery.trim() !== '') ||
      (this.searchQuery && this.searchQuery.trim() !== '') ||
      (this.displayLabel && this.displayLabel.trim() !== '') ||
      (this.date && this.date.length > 0)
    );
  }
  openModal(content: any, project: any) {
    this.selectedProject = project;
    this.selectedPhases = project?.phases || [];
    this.modalService.open(content, { size: 'lg', backdrop: 'static', centered: true });
  }
  getStatusClass(status: string): string {
    if (!status) return '';
    const normalized = status.toLowerCase();
    if (normalized === 'yet to start') return 'status-yet-to-start';
    if (normalized === 'in progress') return 'status-in-progress';
    if (normalized === 'extended') return 'status-extended';
    if (normalized === 'hold') return 'status-hold';
    if (normalized === 'completed') return 'status-completed';
    if (normalized === 'closed') return 'status-closed';
    if (normalized === 'active') return 'status-active';
    return '';
  }
  trackByIndex(index: number) {
    return index;
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;
    const nextSortOrder = order === 1 ? 'asc' : 'desc';

    if (
      this.currentUIField === field &&
      ((this.currentSortOrder === 1 && nextSortOrder === 'asc') ||
        (this.currentSortOrder === -1 && nextSortOrder === 'desc'))
    ) {
      return;
    }

    if (this.currentUIField === field && this.currentSortOrder === -1) {
      this.currentSortField = '';
      this.currentUIField = '';
      this.currentSortOrder = 0;
      if (this.skillDirectoryTable) {
        this.skillDirectoryTable.sortField = '';
        this.skillDirectoryTable.sortOrder = 0;
      }
      this.page = 1;
      this.first = 0;
      this.getEmployeeSkills();
      return;
    }

    this.currentUIField = field;
    this.currentSortField = field;
    this.currentSortOrder = order;
    this.page = 1;
    this.first = 0;
    this.getEmployeeSkills();
  }
}