import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { SidebarModule } from 'primeng/sidebar';
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';
import { debounceTime, filter, Subject, Subscription } from 'rxjs';
import { ChartData, DepartmentCount, SkillProficiencyCount, SummaryCard, SkillSummary, EmployeeSkill, TopSkill } from '../../Interfaces/skill-dashboard.model';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../environments/environment';
import { Chip } from 'primeng/chip';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { MODULE_INFOS } from '../../shared/modules-info';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { TranslateModule } from '@ngx-translate/core';
import { SkillSetMainTabsComponent } from "../../shared/skill-set/skill-set-main-tabs/skill-set-main-tabs.component";
@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule, ChartModule, RouterModule, CardModule, SidebarModule, ProfileIconComponent,
    NoDataFoundComponent, Chip, FormsModule, MultiSelectModule, NgbPopoverModule, ModuleInformationComponent,
    TranslateModule, SkillSetMainTabsComponent],
  templateUrl: './skillset-dashboard.component.html',
  styleUrl: './skillset-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SkillsetDashboardComponent {
  imageUrl: any;
  empinfo: any = {};
  subscription!: Subscription;
  multiSkillOptions: any[] = [];
  // skill level variables
  skillLevelData: any;
  skillLevelOptions: any;
  totalSkillLevelCount: any;
  // skill by Department valribale
  skillByDepartmentData: any;
  skillByDepartmentOptions: any;
  // top Skill variables
  topSkillsData: ChartData = { labels: [], datasets: [] };
  topSkillsOptions: any;
  selectedEmployee: any = null;
  isloading: boolean = false;
  summaryCards: SummaryCard[] = [];
  skillProficiencyCounts: SkillProficiencyCount[] = [];
  deptCounts: DepartmentCount[] = [];
  skillSummaryList: SkillSummary[] = [];
  noDataFound: boolean = false;
  selectedSkillName: string = '';
  employeeList: EmployeeSkill[] = [];
  totalSkillCount: number = 0;
  totalDepartmentSkillCount: number = 0;
  searchQuery: string = '';
  selectedStatus: string[] = ['All Proficiencies'];
  selectedSkills: string[] = ['All Skills'];
  MySkills: any[] = [];
  totalCount!: number;
  //moduleinfo
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  componentname: string = '';
  searchSubject = new Subject<string>();
  EmpProficiency = [
    { label: 'All Proficiencies', value: 'All Proficiencies' },
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Expert', value: 'Expert' },
  ];
  spinnerLoaderforallrecoders = false;
  loader!: boolean;
  allEmployeesList: any[] = [];
  nextMonthAvailableEmployeesList: any[] = [];
  employeeSummary: any = {};
  allocatedEmployeesList: any[] = [];
  availableEmployeesList: any[] = [];
  selectedSkillKey: string = '';

  constructor(private http: HttpService, public formValidation: FormValidationService,
    private offcanvasService: NgbOffcanvas, private router: Router) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.onCheckemployeeProficiency(this.selectedStatus);
    this.skilllevelGraph();
    this.skillByDepartmentGraph();
    this.topSkillsGraph();
    this.getSkillSummary();
    this.getSkillSetTableData();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.getMultiskills();
    this.selectedStatus = ['All Proficiencies'];
    this.searchSubject.pipe(debounceTime(250)).subscribe((skillName) => {
      this.getViewSkillDetails(skillName);
    });
  }
  isOptionDisabled(option: any): boolean {
    return (
      this.selectedStatus.includes('All Proficiencies') &&
      option.value !== 'All Proficiencies'
    );
  }
  updateModuleInfo() {
    const url = this.router.url;
    this.ComponentnameDisplay();
    this.routeToInfoMap = {
      '/skill-management/dashboard': MODULE_INFOS.SKILLSET_MANAGEMENT_DASHBOARD_MODULE_INFO,
    };
    const matchedEntry = Object.entries(this.routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const normalized = status.toLowerCase();
    if (normalized === 'available') return 'status-available';
    if (normalized === 'committed') return 'status-committed';
    return '';
  }

  ComponentnameDisplay() {
    if (this.router.url === '/skill-management/dashboard') {
      this.componentname = 'Dashboard';
    }
  }

  openEnd(content: TemplateRef<any>, skillName: string): void {
    this.selectedSkillName = skillName;
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false     
    }); 
    this.getViewSkillDetails(skillName);
  }
  openEnd2(content: TemplateRef<any>, card: any): void {
    this.selectedSkillName = card.title;
    this.selectedSkillKey = card.key; // frontend only
    this.isloading = true;

    this.getResourcesSummary(() => {
      this.isloading = false;
      this.offcanvasService.open(content, {
        position: 'end',
        backdrop: 'static',
        keyboard: false
      });
    });
  }
  
onCheckemployeeProficiency(selectedValues: string[]) {
  // If 'All Proficiencies' is selected along with others, remove it
  if (selectedValues.includes('All Proficiencies') && selectedValues.length > 1) {
    selectedValues = selectedValues.filter(v => v !== 'All Proficiencies');
  }

  // If nothing is selected, default to 'All Proficiencies'
  if (!selectedValues || selectedValues.length === 0) {
    selectedValues = ['All Proficiencies'];
  }

  this.selectedStatus = selectedValues;

  // Call your graph/table update methods
  this.skilllevelGraph();
  this.skillByDepartmentGraph();
  this.getSkillSetTableData();
  this.topSkillsGraph();
}

  getProficiencyKeys(proficiencyCounts: any): string[] {
    return proficiencyCounts ? Object.keys(proficiencyCounts) : [];
  }

  close(modal: any) {
    modal.close();
    this.searchQuery = '';
  }
  private searchTimer: any;
  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.getResourcesSummary();
    }, 400);
  }

  getResourcesSummary(callback?: () => void): void {
    const params: any = {};
    if (this.searchQuery?.trim()) {
      params.searchQuery = this.searchQuery.trim();
    }
    this.isloading = true;
    this.http.getDataIncludeParams('EmployeeSkills/getEmployeeSummary', params).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.success && res.data) {
          const summary = res.data;
          const addProfileImage = (list: any[] = []) =>
            list.map(emp => ({ ...emp, profileImage: this.getImageUrl(emp.profileImage) }));
          this.employeeSummary = {
            allEmployeesList: addProfileImage(summary.allEmployeesList || []),
            allocatedEmployeesList: addProfileImage(summary.allocatedEmployeesList || []),
            availableEmployeesList: addProfileImage(summary.availableEmployeesList || []),
            nextMonthAvailableEmployeesList: addProfileImage(summary.nextMonthAvailableEmployeesList || []),
          };
          switch (this.selectedSkillKey) {
            case 'total':
              this.employeeList = this.employeeSummary.allEmployeesList;
              break;
            case 'committed':
              this.employeeList = this.employeeSummary.allocatedEmployeesList;
              break;
            case 'available':
              this.employeeList = this.employeeSummary.availableEmployeesList;
              break;
            case 'upcoming':
              this.employeeList = this.employeeSummary.nextMonthAvailableEmployeesList;
              break;
            default:
              this.employeeList = this.employeeSummary.allEmployeesList;
          }
        } else {
          this.resetSummaryData();
        }
        if (callback) callback();
      },
      error: (err) => {
        this.isloading = false;
        console.error('Error fetching resource summary:', err);
        this.resetSummaryData();
        if (callback) callback();
      }
    });
  }

  resetSummaryData(): void {
    this.employeeSummary = null;
    this.allEmployeesList = [];
    this.allocatedEmployeesList = [];
    this.availableEmployeesList = [];
    this.nextMonthAvailableEmployeesList = [];
    this.employeeList = [];
  }

  getSkillSummary() {
    this.isloading = true;
    this.subscription = this.http.getData('EmployeeSkills/getEmployeeSummaryCount').subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data) {
          const summary = res.data;
          this.summaryCards = [
            { key: 'total', title: 'Total Resources', value: summary.totalEmployees ?? 0, icons: './icons/Total Employee Count.png' },
            { key: 'committed', title: 'Committed Resources', value: summary.allocatedEmployees ?? 0, icons: './icons/Committed Employees Count.png' },
            { key: 'available', title: 'Available Resources', value: summary.availableEmployees ?? 0, icons: './icons/Available Employees Count.png' },
            { key: 'upcoming', title: 'Upcoming Available Resources', value: summary.nextMonthAvailableEmployees ?? 0, icons: './icons/Soon to be Available.png' }
          ];
        }
      },
      error: (err) => {
        this.isloading = false;
        console.error('Error fetching summary counts:', err);
      }
    });
  }

  skilllevelGraph(): void {
    this.isloading = true;
    const params: any = {};
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    if (this.selectedSkills?.length > 0 && !this.selectedSkills.includes('All Skills')) {
      params.skills = this.selectedSkills.join(',');
    }
    this.http.getDataIncludeParams('EmployeeSkills/getSkillSummary', params).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data) {
          const { expertCount, intermediateCount, beginnerCount, totalSkillCount } = res.data;
          this.totalSkillCount = totalSkillCount;
          const colors = ['#00A912', '#9A00F3', '#F8AF13'];
          this.skillLevelData = {
            labels: ['Expert', 'Intermediate', 'Beginner'],
            datasets: [
              {
                data: [expertCount, intermediateCount, beginnerCount],
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2,
              },
            ],
          };
          this.skillLevelOptions = {
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    return `${label}: ${value}`;
                  },
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          };
          this.skillProficiencyCounts = [
            { label: 'Expert', count: expertCount, color: colors[0] },
            { label: 'Intermediate', count: intermediateCount, color: colors[1] },
            { label: 'Beginner', count: beginnerCount, color: colors[2] },
          ];
        }
      },
      error: () => (this.isloading = false),
    });
  }

  skillByDepartmentGraph(): void {
    this.isloading = true;
    const params: any = {};
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    if (this.selectedSkills?.length > 0 && !this.selectedSkills.includes('All Skills')) {
      params.skills = this.selectedSkills.join(',');
    }
    this.http.getDataIncludeParams('EmployeeSkills/getDepartmentSkillSummary', params).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data?.length) {
          const validDepartments = res.data.filter((d: any) => d.departmentName?.trim());
          const counts = validDepartments.map((d: any) => d.uniqueSkillCount);
          const labels = validDepartments.map((d: any) => d.departmentName);
          const colors = validDepartments.map((d: any) => d.colorCode);
          this.totalDepartmentSkillCount = counts.reduce((a: number, b: number) => a + b, 0);
          this.skillByDepartmentData = {
            labels,
            datasets: [
              {
                data: counts,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 10
              }
            ]
          };
          this.skillByDepartmentOptions = {
            cutout: '60%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const dataset = context.dataset;
                    const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                    const value = dataset.data[context.dataIndex];
                    const percentage = ((value / total) * 100).toFixed(1) + '%';
                    return `${context.label}: ${value} (${percentage})`;
                  }
                }
              }
            },
            elements: {
              arc: { borderWidth: 3, borderColor: '#fff' }
            },
            responsive: true,
            maintainAspectRatio: false
          };
          this.deptCounts = validDepartments.map((d: any) => ({
            label: d.departmentName,
            count: d.uniqueSkillCount,
            color: d.colorCode,
            percentage: ((d.uniqueSkillCount / this.totalDepartmentSkillCount) * 100).toFixed(1)
          }));
        } else {
          this.skillByDepartmentData = { labels: [], datasets: [] };
          this.deptCounts = [];
        }
      },
      error: (err) => {
        console.error('Error fetching department skills:', err);
        this.isloading = false;
        this.skillByDepartmentData = { labels: [], datasets: [] };
        this.deptCounts = [];
      }
    });
  }

  topSkillsGraph(): void {
    this.isloading = true;
    const params: any = {};
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    if (this.selectedSkills?.length > 0 && !this.selectedSkills.includes('All Skills')) {
      params.skills = this.selectedSkills.join(',');
    }
    this.http.getDataIncludeParams('EmployeeSkills/getMostCommonSkills', params).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const skills: TopSkill[] = res.data;
          const top5 = skills.sort((a, b) => b.employeeCount - a.employeeCount).slice(0, 5);
          const labels = top5.map((s: TopSkill) => {
            const name = s.skillName.charAt(0).toUpperCase() + s.skillName.slice(1);
            if (name.length > 15) {
              const chunks = name.match(/.{1,15}/g) || [name];
              return chunks;
            }
            return [name];
          });
          const counts = top5.map(s => s.employeeCount);
          const colors = top5.map(s => s.colorCode || '#42A5F5');
          this.topSkillsData = {
            labels: labels as any,
            datasets: [
              {
                label: 'Resources Count',
                data: counts,
                backgroundColor: colors,
                barThickness: 20,
              },
            ],
          };
          this.topSkillsOptions = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                align: 'start',
                color: '#1F2937',
                font: { size: 16, weight: 'bold' },
              },
              tooltip: {
                backgroundColor: '#111827',
                titleColor: '#FFF',
                bodyColor: '#FFF',
                cornerRadius: 6,
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { display: false },
                ticks: {
                  color: '#6B7280',
                  font: { size: 12 },
                  // This ensures only integer values are shown
                  callback: function (value: any) {
                    if (Number.isInteger(value)) {
                      return value;
                    }
                    return '';
                  },
                },
                title: {
                  display: true,
                  text: 'Resources Count',
                  color: '#6B7280',
                  font: { size: 13 },
                },
              },
              y: {
                grid: { display: false },
                ticks: {
                  color: '#111827',
                  font: { size: 13, weight: '500' },
                  lineHeight: 3,
                  autoSkip: false,
                },
                title: {
                  display: true,
                  text: 'Skills',
                  color: '#6B7280',
                  font: { size: 13 },
                },
              },
            },
          };
        } else {
          this.topSkillsData = { labels: [], datasets: [] };
        }
      },
      error: (err) => {
        console.error('Error fetching top skills:', err);
        this.isloading = false;
        this.topSkillsData = { labels: [], datasets: [] };
      },
    });
  }

  getSkillSetTableData(): void {
    this.isloading = true;
    const params: any = {};
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    if (this.selectedSkills?.length > 0 && !this.selectedSkills.includes('All Skills')) {
      params.skills = this.selectedSkills.join(',');
    }
    this.http.getDataIncludeParams('EmployeeSkills/getSkillSummaryCountAsync', params).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.success && Array.isArray(res.data) && res.data.length) {
          this.skillSummaryList = res.data as SkillSummary[];
          this.noDataFound = false;
        } else {
          this.skillSummaryList = [];
          this.noDataFound = true;
        }
      },
      error: (err) => {
        console.error('Error fetching skill summary table:', err);
        this.isloading = false;
        this.skillSummaryList = [];
        this.noDataFound = true;
      }
    });
  }

  getViewSkillDetails(skillName?: string): void {
    // this.isloading = true;
    const params: any = {};
    if (skillName && skillName.trim() !== '') {
      params.skillName = skillName;
    }
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      params.search = this.searchQuery;
    }
    if (this.selectedStatus?.length) {
      if (this.selectedStatus.includes('All Proficiencies')) {
      } else {
        params.proficiencyLevel = this.selectedStatus.join(',');
      }
    }
    this.http.getDataIncludeParams('EmployeeSkills/getEmployeesBySkill', params).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.success && Array.isArray(res.data)) {
          this.employeeList = res.data.map((emp: any) => ({
            ...emp,
            profileImage: this.getImageUrl(emp.profileImage)
          }));
          this.noDataFound = this.employeeList.length === 0;
        }
        else {
          this.employeeList = [];
          this.noDataFound = true;
        }
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.isloading = false;
        this.employeeList = [];
        this.noDataFound = true;
      }
    });
  }

  private getImageUrl(imagePath: string): string | null {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('Profilepics/')) {
      return `${environment.viewUrl}${imagePath}`;
    }
    return `${environment.ApiUrl}EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }

  getMultiskills() {
    this.loader = true;
    this.subscription = this.http.getData(`EmployeeSkills/getDistinctEmployeeSkills`).subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.data)) {
          this.multiSkillOptions = [
            { label: 'All Skills', value: 'All Skills' },
            ...response.data.map((skill: any) => ({
              label: skill.skillName,
              value: skill.skillName,
            })),
          ];
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

  clearAllFilters(): void {
    this.selectedStatus = ['All Proficiencies'];
    this.selectedSkills = ['All Skills'];
    this.skilllevelGraph();
    this.skillByDepartmentGraph();
    this.getSkillSetTableData();
    this.topSkillsGraph();
    this.searchQuery = ''
  }

  onSkillSelectionChange(): void {
    this.skilllevelGraph();
    this.skillByDepartmentGraph();
    this.getSkillSetTableData();
    this.topSkillsGraph();
  }
}