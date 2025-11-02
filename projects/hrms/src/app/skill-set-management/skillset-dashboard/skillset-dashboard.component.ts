import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { SidebarModule } from 'primeng/sidebar';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { OpenModalService } from '../../services/open-modal.service';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ChartData, DepartmentCount, SkillProficiencyCount, SummaryCard, SkillSummary, EmployeeSkill } from '../../Interfaces/skill-dashboard.model';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../environments/environment.dev';
import { Chart } from 'chart.js';
@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule, ChartModule, RouterModule, CardModule, SidebarModule, ProfileIconComponent, NoDataFoundComponent],
  templateUrl: './skillset-dashboard.component.html',
  styleUrl: './skillset-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SkillsetDashboardComponent {
  imageUrl: any;
  empinfo: any = {};
  subscription!: Subscription;
  // skill level variables
  skillLevelData: any;
  skillLevelOptions: any;
  totalSkillLevelCount: any;
  // skill by Department valribale
  skillByDepartmentData: any;
  skillByDepartmentOptions: any;
  // top Skill variables
  topSkillsData!: ChartData;
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
  totalDepartmentSkillCount:number =0;

  constructor(private http: HttpService, public formValidation: FormValidationService, private offcanvasService: NgbOffcanvas) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.skilllevelGraph();
    this.skillByDepartmentGraph();
    this.topSkillsGraph();
    this.getSkillSummary()
    this.getSkillSetTableData()
  }

  openEnd(content: TemplateRef<any>, skillName: string): void {
    this.selectedSkillName = skillName;
    this.offcanvasService.open(content, { position: 'end' });
    this.getViewSkillDetails(skillName);
  }

  getProficiencyText(proficiencyCounts: any): string {
    if (!proficiencyCounts) return '—';
    return Object.keys(proficiencyCounts)
      .map(key => `${key} (${proficiencyCounts[key]})`)
      .join(', ');
  }

  getSkillSummary() {
    this.isloading = true;
    this.subscription = this.http.getData(`EmployeeSkills/getEmployeeSummary`).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data) {
          const summary = res.data;
          this.summaryCards = [
            { title: 'Total Employee Count', value: summary.totalEmployees ?? 0 },
            { title: 'Employees Committed Count', value: summary.allocatedEmployees ?? 0 },
            { title: 'Employees Available Count', value: summary.availableEmployees ?? 0 },
            { title: 'Soon to be Available', value: summary.nextMonthAvailableEmployees ?? 0 }
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
    this.http.getData(`EmployeeSkills/getSkillSummary`).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data) {
          const { expertCount, intermediateCount, beginnerCount,totalSkillCount} = res.data;
          console.log(res.data)
           this.totalSkillCount = totalSkillCount
          // --- Chart Data ---
          this.skillLevelData = {
            labels: ['Expert', 'Intermediate', 'Beginner'],
            datasets: [
              {
                data: [expertCount, intermediateCount, beginnerCount],
                backgroundColor: ['#FF9800', '#3F51B5', '#00C49F'],
                borderWidth: 0
              }
            ]
          };
          // --- Chart Options ---
          this.skillLevelOptions = {
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true }
            }
          };

          // --- Bottom Counts ---
          this.skillProficiencyCounts = [
            { label: 'Expert', count: expertCount },
            { label: 'Intermediate', count: intermediateCount },
            { label: 'Beginner', count: beginnerCount },
          ];
        }
      },
      error: () => {
        this.isloading = false;
      }
    });
  }

 skillByDepartmentGraph(): void {
  this.isloading = true;
  this.http.getData(`EmployeeSkills/getDepartmentSkillSummary`).subscribe({
    next: (res: any) => {
      this.isloading = false;
      if (res?.data?.length) {
        const validDepartments = res.data.filter(
          (d: { departmentName: string }) => d.departmentName?.trim()
        );

        const counts = validDepartments.map(
          (d: { uniqueSkillCount: number }) => d.uniqueSkillCount
        );
        const labels = validDepartments.map(
          (d: { departmentName: string }) => d.departmentName
        );
        const colors = validDepartments.map(
          (d: { colorCode: string }) => d.colorCode
        );

        //  total unique skill count for center display
        this.totalDepartmentSkillCount = counts.reduce(
          (a: any, b: any) => a + b,
          0
        );

        // chart setup
        this.skillByDepartmentData = {
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: colors,
              borderWidth: 0
            }
          ]
        };

        // chart options
        this.skillByDepartmentOptions = {
          cutout: '70%',
          plugins: { legend: { display: false } }
        };

        //  populate grid data below chart
        this.deptCounts = validDepartments.map((d: any) => ({
          label: d.departmentName,
          count: d.uniqueSkillCount
        }));
      }
    },
    error: () => {
      this.isloading = false;
    }
  });
}


  topSkillsGraph(): void {
    this.isloading = true;
    this.http.getData('EmployeeSkills/getMostCommonSkills').subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data?.length) {
          const skills = res.data;
          const labels = skills.map((s: any) => s.skillName);
          const counts = skills.map((s: any) => s.employeeCount);
          this.topSkillsData = {
            labels,
            datasets: [
              {
                label: 'No of Employees',
                data: counts,
                backgroundColor: [
                  '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A',
                  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F87171',
                  '#22C55E', '#6366F1', '#D946EF', '#0EA5E9', '#FACC15'
                ]
              }
            ]
          };
          this.topSkillsOptions = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (context: any) {
                    return `${context.dataset.label}: ${context.parsed.x}`;
                  }
                }
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { color: '#666' }
              },
              y: {
                grid: { display: false },
                ticks: { color: '#666' }
              }
            }
          };
        }
      },
      error: (err) => {
        this.isloading = false;
        console.error('Error fetching top skills:', err);
      }
    });
  }

  getSkillSetTableData() {
    this.isloading = true;
    this.http.getData('EmployeeSkills/getSkillSummaryCountAsync').subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res.success && res.data?.length) {
          this.skillSummaryList = res.data as SkillSummary[];
          this.noDataFound = false;
        } else {
          this.skillSummaryList = [];
          this.noDataFound = true;
        }
      },
      error: () => {
        this.isloading = false;
        this.skillSummaryList = [];
        this.noDataFound = true;
      }
    });
  }

  getViewSkillDetails(skillName: string): void {
    const params = { skillName };
    this.http.getDataIncludeParams('EmployeeSkills/getEmployeesBySkill', params).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          this.employeeList = res.data.map((emp: any) => ({
            ...emp,
            profileImage: this.getImageUrl(emp.profileImage)
          }));

          console.log('Employee list with images:', this.employeeList);
        } else {
          this.employeeList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.employeeList = [];
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
}