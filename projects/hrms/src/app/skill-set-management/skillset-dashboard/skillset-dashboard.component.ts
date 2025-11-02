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
import { ChartData, DepartmentCount, SkillProficiencyCount, SummaryCard } from '../../Interfaces/skill-dashboard.model';

@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule, ChartModule, RouterModule, CardModule, SidebarModule, ProfileIconComponent],
  templateUrl: './skillset-dashboard.component.html',
  styleUrl: './skillset-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SkillsetDashboardComponent {
  imageUrl: any
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


  constructor(private http: HttpService, public formValidation: FormValidationService, private offcanvasService: NgbOffcanvas, private sanitizer: DomSanitizer,
    private readonly modalService: NgbModal, private openmodalservice: OpenModalService) { }
  ngOnInit() {
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
    this.skilllevelGraph();
    this.skillByDepartmentGraph();
    this.topSkillsGraph();
    this.getSkillSummary()
  }
  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
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
          const { expertCount, intermediateCount, beginnerCount } = res.data;
          // --- Chart Data ---
          this.skillLevelData = {
            labels: ['Expert', 'Intermediate', 'Beginner'],
            datasets: [
              {
                data: [expertCount, intermediateCount, beginnerCount],
                backgroundColor: ['#FF9800', '#E91E63', '#3F51B5']
              }
            ]
          };
          // --- Chart Options ---
          this.skillLevelOptions = {
            cutout: '60%',
            plugins: {
              legend: { display: false }
            }
          };
          // --- Display counts below chart ---
          this.skillProficiencyCounts = [
            { label: 'Expert', count: expertCount },
            { label: 'Intermediate', count: intermediateCount },
            { label: 'Beginner', count: beginnerCount }
          ];
        }
      },
      error: () => {
        this.isloading = false;
      }
    });
  }
  // Skill level graph
  skillByDepartmentGraph(): void {
    this.isloading = true;
    this.http.getData(`EmployeeSkills/getDepartmentSkillSummary`).subscribe({
      next: (res: any) => {
        this.isloading = false;
        if (res?.data?.length) {
          const validDepartments = res.data.filter((d: { departmentName: string; }) => d.departmentName?.trim());
          const counts = validDepartments.map((d: { uniqueSkillCount: any; }) => d.uniqueSkillCount);
          const labels = validDepartments.map((d: { departmentName: any; }) => d.departmentName);
          // total count
          this.totalSkillLevelCount = counts.reduce((a: any, b: any) => a + b, 0);
          // Chart setup
          this.skillByDepartmentData = {
            labels,
            datasets: [
              {
                data: counts,
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#22c55e']
              }
            ]
          };
          this.skillByDepartmentOptions = {
            cutout: '60%',
            plugins: {
              legend: { display: false }
            }
          };
          // Grid below chart
          this.deptCounts = validDepartments.map((d: { departmentName: any; uniqueSkillCount: any; }) => ({
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
          indexAxis: 'y', // ✅ makes it horizontal
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

  // getSkillSetTableData(){
  //   this.isloading = true;
  //   this.http.getData(`EmployeeSkills/getSkillSummaryCountAsync`).subscribe({
  // }
}