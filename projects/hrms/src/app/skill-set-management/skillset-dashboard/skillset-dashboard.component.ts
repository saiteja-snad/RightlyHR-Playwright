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
import { filter, Subscription } from 'rxjs';
import { ChartData, DepartmentCount, SkillProficiencyCount, SummaryCard, SkillSummary, EmployeeSkill, TopSkill } from '../../Interfaces/skill-dashboard.model';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../environments/environment.dev';
import { Chip } from 'primeng/chip';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { MODULE_INFOS } from '../../shared/modules-info';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule, ChartModule, RouterModule, CardModule, SidebarModule, ProfileIconComponent,
    NoDataFoundComponent, Chip, FormsModule, MultiSelectModule, Select, NgbPopoverModule,
    ModuleInformationComponent, TranslateModule],
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
  selectedSkills: string[] = [];
  MySkills: any[] = [];
  totalCount!: number;
  //moduleinfo
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  componentname: string = '';

  EmpProficiency = [
    { label: 'All Proficiencies', value: 'All Proficiencies' },
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Expert', value: 'Expert' },
  ];
  spinnerLoaderforallrecoders = false;
  loader!: boolean;

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

  ComponentnameDisplay() {
    if (this.router.url === '/skill-management/dashboard') {
      this.componentname = 'Skill Set Dashboard';
    }
  }

  openEnd(content: TemplateRef<any>, skillName: string): void {
    this.selectedSkillName = skillName;
    this.offcanvasService.open(content, { position: 'end' });
    this.getViewSkillDetails(skillName);
  }

  onCheckemployeeProficiency(statusValue: any) {
    this.selectedStatus = !statusValue || statusValue === 'All Proficiencies' ? 'All Proficiencies' : statusValue;
    this.skilllevelGraph();
    this.skillByDepartmentGraph()
    this.getSkillSetTableData()
    this.topSkillsGraph()
  }

  getProficiencyKeys(proficiencyCounts: any): string[] {
    return proficiencyCounts ? Object.keys(proficiencyCounts) : [];
  }

  getSkillSummary() {
    this.isloading = true;
    this.subscription = this.http.getData(`EmployeeSkills/getEmployeeSummary`).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data) {
          const summary = res.data;
          this.summaryCards = [
            { title: 'Total Employees', value: summary.totalEmployees ?? 0, icons: './icons/Total Employee Count.png' },
            { title: 'Committed Employees', value: summary.allocatedEmployees ?? 0, icons: './icons/Committed Employees Count.png' },
            { title: 'Available Employees', value: summary.availableEmployees ?? 0, icons: './icons/Available Employees Count.png' },
            { title: 'Upcoming Available Resources', value: summary.nextMonthAvailableEmployees ?? 0, icons: './icons/Soon to be Available.png' }
          ];
        }
      },
      error: (reason) => {
        this.isloading = false;
        console.error('Error fetching employee data:', reason);
      },
    });
  }

  skilllevelGraph(): void {
    this.isloading = true;
    const params: any = {};
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    if (this.selectedSkills?.length > 0) {
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

    // Only send proficiencies if not "All Proficiencies"
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }

    //  Only send selected skills if any are chosen
    if (this.selectedSkills?.length > 0) {
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

          /**  Department Chart Data **/
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

          /**  Chart Options **/
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

          /**  Department Count Summary **/
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
    // Add proficiency filter if not "All Proficiencies"
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    // Add skills filter if any skill is selected
    if (this.selectedSkills?.length > 0) {
      params.skills = this.selectedSkills.join(',');
    }

    this.http.getDataIncludeParams('EmployeeSkills/getMostCommonSkills', params).subscribe({
      next: (res: any) => {
        this.isloading = false;

        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const skills: TopSkill[] = res.data;

          // Sort and take only Top 5
          const top5 = skills.sort((a, b) => b.employeeCount - a.employeeCount).slice(0, 5);

          // Prepare chart data
          const labels = top5.map(s => s.skillName.charAt(0).toUpperCase() + s.skillName.slice(1));
          const counts = top5.map(s => s.employeeCount);
          const colors = top5.map(s => s.colorCode || '#42A5F5');

          this.topSkillsData = {
            labels,
            datasets: [
              {
                label: 'Employee Count',
                data: counts,
                backgroundColor: colors,
                barThickness: 20,
              }
            ]
          };

          // Chart options for horizontal clean layout
          this.topSkillsOptions = {
            indexAxis: 'y',
            responsive: true,
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
                ticks: { color: '#6B7280', font: { size: 12 } },
                title: {
                  display: true,
                  text: 'Employee Count',
                  color: '#6B7280',
                  font: { size: 13 },
                }
              },
              y: {
                grid: { display: false },
                ticks: { color: '#111827', font: { size: 13, weight: '500' } },
                title: {
                  display: true,
                  text: 'Skills',
                  color: '#6B7280',
                  font: { size: 13 },
                }
              }
            }
          };
        } else {
          this.topSkillsData = { labels: [], datasets: [] };
        }
      },
      error: (err) => {
        console.error('Error fetching top skills:', err);
        this.isloading = false;
        this.topSkillsData = { labels: [], datasets: [] };
      }
    });
  }

  getSkillSetTableData(): void {
    this.isloading = true;
    const params: any = {};
    // Add proficiency filter if not "All Proficiencies"
    if (this.selectedStatus && !this.selectedStatus.includes('All Proficiencies')) {
      params.proficiencies = this.selectedStatus.join(',');
    }
    //  Add skills filter if any skill is selected
    if (this.selectedSkills?.length > 0) {
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


  getViewSkillDetails(skillName: string): void {
    this.isloading = true;

    const params: any = { skillName };

    // Always send proficiency — if "All Proficiencies" is selected, send all values
    if (this.selectedStatus?.length) {
      if (this.selectedStatus.includes('All Proficiencies')) {
        // Send all available proficiencies
        const allProficiencies = this.EmpProficiency
          .filter((p: any) => p.value !== 'All Proficiencies')
          .map((p: any) => p.value);
        params.proficiencyLevel = allProficiencies.join(',');
      } else {
        params.proficiencyLevel = this.selectedStatus.join(',');
      }
    }

    // Add skills filter if any skill is selected
    if (this.selectedSkills?.length > 0) {
      params.skills = this.selectedSkills.join(',');
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
        } else {
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


  clearAllFilters(): void {
    this.selectedStatus = ['All Proficiencies'];
    this.selectedSkills = [];
    this.skilllevelGraph();
    this.skillByDepartmentGraph()
    this.getSkillSetTableData()
    this.topSkillsGraph()
  

  }

  onSkillSelectionChange(): void {
    this.skilllevelGraph()
    this.skillByDepartmentGraph()
    this.getSkillSetTableData()
    this.topSkillsGraph()
  }
}