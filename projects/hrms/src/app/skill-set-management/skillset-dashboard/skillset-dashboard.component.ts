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
import { DomSanitizer } from '@angular/platform-browser';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { SkeletonModule } from 'primeng/skeleton';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule, ChartModule, RouterModule, CardModule, SidebarModule, ProfileIconComponent, ModuleInfoIconComponent,
    NoDataFoundComponent, Chip, FormsModule, MultiSelectModule, NgbPopoverModule, ModuleInformationComponent, SkeletonModule,
    TranslateModule, SkillSetMainTabsComponent, DataLoaderContentComponent],
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
  isgraphsContent = false
  isLoadingGraphDepartment = false;
  isLoadingGraphSkillProficiency = false;
  isLoadingGraphTopSkills = false;
  chartLoader = false
  // contentInfo
  topTrendingContentInfo = 'Highlights the five most in-demand skills within the organization based on employee proficiency data. This visualization helps management identify emerging skill trends, align training initiatives, and support strategic workforce planning.';
  skillProficiencyContentInfo = 'Presents a consolidated view of employee skill levels—categorized as Beginner, Intermediate, and Expert. This chart enables HR and leadership teams to evaluate overall workforce competency and pinpoint areas requiring skill enhancement or upskilling.';
  departmentWiseContentInfo = 'Depicts the distribution of skills across various departments, offering insights into departmental expertise and specialization areas. This helps in understanding which teams possess key technical or functional capabilities and identifying potential skill gaps.';
  skillOverviewContentInfo = 'Provides a detailed breakdown of each skill, the number of employees associated with it, and their respective proficiency levels. This data-driven summary facilitates competency tracking, supports resource allocation, and assists in informed decision-making for project or training assignments.';

  constructor(private http: HttpService, public formValidation: FormValidationService, private sanitizer: DomSanitizer,
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
  trackBySkillName(index: number, item: any): string {
    return item?.skillName ?? index;
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

          // Step 1: initialize all lists with default placeholder
          const addProfileImage = (list: any[] = []) =>
            list.map(emp => ({
              ...emp,
              profileImage: 'images/alternate.png',
              originalProfileUrl: emp.profileImage || emp.profileUrl || ''
            }));

          this.employeeSummary = {
            allEmployeesList: addProfileImage(summary.allEmployeesList || []),
            allocatedEmployeesList: addProfileImage(summary.allocatedEmployeesList || []),
            availableEmployeesList: addProfileImage(summary.availableEmployeesList || []),
            nextMonthAvailableEmployeesList: addProfileImage(summary.nextMonthAvailableEmployeesList || [])
          };

          // Step 2: load actual images asynchronously
          Object.values(this.employeeSummary).forEach((list: any) => {
            if (Array.isArray(list)) {
              list.forEach((emp: any) => this.downloadAndSetProfileImage(emp));
            }
          });

          // Step 3: assign list by key
          switch (this.selectedSkillKey) {
            case 'total': this.employeeList = this.employeeSummary.allEmployeesList; break;
            case 'committed': this.employeeList = this.employeeSummary.allocatedEmployeesList; break;
            case 'available': this.employeeList = this.employeeSummary.availableEmployeesList; break;
            case 'upcoming': this.employeeList = this.employeeSummary.nextMonthAvailableEmployeesList; break;
            default: this.employeeList = this.employeeSummary.allEmployeesList;
          }
        } else {
          this.resetSummaryData();
        }
        if (callback) callback();
      }
    })
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

    this.subscription = this.http.getData('EmployeeSkills/getEmployeeSummaryCount').subscribe({
      next: (res: any) => {
        this.chartLoader = true;
        if (res?.data) {
          const summary = res.data;
          this.summaryCards = [
            { key: 'total', title: 'Total Resources', value: summary.totalEmployees ?? 0, icons: './icons/Total Employee Count.png' },
            { key: 'committed', title: 'Committed Resources', value: summary.allocatedEmployees ?? 0, icons: './icons/Committed Employees Count.png' },
            { key: 'available', title: 'Available Resources', value: summary.availableEmployees ?? 0, icons: './icons/Available Employees Count.png' },
            { key: 'upcoming', title: 'Resources Releasing Within 30 Days', value: summary.nextMonthAvailableEmployees ?? 0, icons: './icons/Soon to be Available.png' }
          ];
        }
      },
      error: (err) => {
        this.isloading = false;
        this.chartLoader = false;
        console.error('Error fetching summary counts:', err);
      }
    });
  }
  get hasskilllevelGraphData(): boolean {
    return !!(
      this.skillLevelData?.datasets?.length &&
      this.skillLevelData.datasets[0]?.data?.length
    );
  }
  get hasDepartmentwiseGraphData(): boolean {
    return !!(
      this.skillByDepartmentData?.datasets?.length &&
      this.skillByDepartmentData.datasets[0]?.data?.length
    );
  }
  get hasTopSkillGraphData(): boolean {
    return !!(
      this.topSkillsData?.datasets?.length &&
      this.topSkillsData.datasets[0]?.data?.length
    );
  }
  hasnodata = false;
  skilllevelGraph(): void {
    this.isLoadingGraphSkillProficiency = true;
    this.noDataFound = false;
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
        this.isLoadingGraphSkillProficiency = false;
        if (res.data.totalSkillCount === 0 && res.data.intermediateCount === 0 && res.data.beginnerCount === 0 && res.data.expertCount === 0) {
          this.hasnodata = true;
        } else {
          this.hasnodata = false;
        }
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
        this.noDataFound = false;
      },
      error: () => (this.isloading = false),
    });
  }

  skillByDepartmentGraph(): void {
    this.isLoadingGraphDepartment = true;
    this.noDataFound = false;
    const params: any = {};
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    if (this.selectedSkills?.length > 0 && !this.selectedSkills.includes('All Skills')) {
      params.skills = this.selectedSkills.join(',');
    }
    this.http.getDataIncludeParams('EmployeeSkills/getDepartmentSkillSummary', params).subscribe({
      next: (res: any) => {
        this.isLoadingGraphDepartment = false;
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
            responsive: true,
            maintainAspectRatio: false
          };
          this.deptCounts = validDepartments.map((d: any, index: number) => ({
            label: d.departmentName,
            count: d.uniqueSkillCount,
            color: d.colorCode, percentage: ((d.uniqueSkillCount / this.totalDepartmentSkillCount) * 100).toFixed(1)
          }));
          this.noDataFound = false;
        } else {
          this.skillByDepartmentData = { labels: [], datasets: [] };
          this.deptCounts = [];
          // this.noDataFound = true;
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
    this.isLoadingGraphTopSkills = true
    const params: any = {};
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    if (this.selectedSkills?.length > 0 && !this.selectedSkills.includes('All Skills')) {
      params.skills = this.selectedSkills.join(',');
    }
    this.http.getDataIncludeParams('EmployeeSkills/getMostCommonSkills', params).subscribe({
      next: (res: any) => {
        this.isLoadingGraphTopSkills = false;
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
          const staticColors = ['#FDCC11', '#FF207F', '#187DF5', '#00A912', '#4533E3'];
          const colors = staticColors.slice(0, top5.length);

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
    this.noDataFound = true;
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
          this.noDataFound = false;
        }
      },
      error: (err) => {
        console.error('Error fetching skill summary table:', err);
        this.isloading = false;
        this.skillSummaryList = [];
        this.noDataFound = false;
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
            profileImage: 'images/alternate.png',
            originalProfileUrl: emp.profileImage || emp.profileUrl || ''
          }));

          // download actual images after list ready
          this.employeeList.forEach((emp: any) => this.downloadAndSetProfileImage(emp));

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


  downloadAndSetProfileImage(emp: any): void {
    if (!emp || !emp.originalProfileUrl) return;

    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', emp.originalProfileUrl).subscribe({
      next: (res: any) => {
        const blob = new Blob([res['body']], { type: 'image/png' });
        const objectURL = URL.createObjectURL(blob);
        emp.profileImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: () => {
        emp.profileImage = 'images/alternate.png';
      }
    });
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
    const isFilterApplied =
      (this.selectedStatus && this.selectedStatus.length && this.selectedStatus[0] !== 'All Proficiencies') ||
      (this.selectedSkills && this.selectedSkills.length && this.selectedSkills[0] !== 'All Skills') ||
      (this.searchQuery && this.searchQuery.trim() !== '');

    if (isFilterApplied) {
      this.selectedStatus = ['All Proficiencies'];
      this.selectedSkills = ['All Skills'];
      this.searchQuery = '';

      this.skilllevelGraph();
      this.skillByDepartmentGraph();
      this.getSkillSetTableData();
      this.topSkillsGraph();
    } else {
      this.selectedStatus = ['All Proficiencies'];
      this.selectedSkills = ['All Skills'];
      this.searchQuery = '';
    }
  }

  
  onSkillSelectionChange(): void {
    this.skilllevelGraph();
    this.skillByDepartmentGraph();
    this.getSkillSetTableData();
    this.topSkillsGraph();
  }
}