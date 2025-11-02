import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-project-timesheet-summary',
  imports: [CommonModule, SelectModule, TranslateModule, ChartModule],
  templateUrl: './project-timesheet-summary.component.html',
  styleUrl: './project-timesheet-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProjectTimesheetSummaryComponent {
  projectsDataDropdown = [
    { projectId: 1, projectName: 'Website Redesign' },
    { projectId: 2, projectName: 'Mobile App Development' },
    { projectId: 3, projectName: 'CRM Integration' },
    { projectId: 4, projectName: 'E-commerce Platform' },
    { projectId: 5, projectName: 'Data Migration' }
  ];

  statusOptions = [
    { label: 'Not Started', value: 'not_started' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'On Hold', value: 'on_hold' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];
  // Project wise Resource Count variables
  projectResourceData: any;
  projectResourceOptions: any;
  // Department wise Contribution variables
  departmentContributionData: any;
  departmentContributionOptions: any;
  // Estimated Vs ActualData variables
  estimatedVsActualData: any;
  estimatedVsActualOptions: any;
  // Billable Data variables
  billableData: any;
  billableOptions: any;
  // Burn Down Data variables
  burndownData: any;
  burndownOptions: any;
  //Gauge Data
  gaugeData: any;
  gaugeOptions: any;
  completionRate = 100;
 destroy$: Subject<boolean> = new Subject<boolean>();
   constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router,
    public formValidation: FormValidationsService, private http: HttpService,
    private conformationPopup: OpenModalService, private route: ActivatedRoute) { }
  ngOnInit() {
    this.projectWiseResourceCountGraph();
    this.departmentWiseContributionGraph();
    this.createGaugeChart();
    this.estimatedActualChart();
    this.billableChart();
    this.burnDownChart();
  }

  // Project wise Resource Count
  // projectWiseResourceCountGraph() {
  //   this.projectResourceData = {
  //     labels: ['E-commerce', 'Admin App', 'User App', 'Web App', 'Mobile App'],
  //     datasets: [
  //       {
  //         data: [60, 50, 70, 30],
  //         backgroundColor: ['#FDCC11', '#FF207F', '#187DF5', '#00A912', '#4533E3'],
  //         barThickness: 10
  //       }
  //     ]
  //   };

  //   this.projectResourceOptions = {
  //     indexAxis: 'y', // Horizontal bar
  //     scales: {
  //       x: {
  //         title: {
  //           display: true,
  //           text: 'Resource Count'
  //         },
  //         grid: { display: false }
  //       },
  //       y: {
  //         title: {
  //           display: true,
  //           text: 'Projects'
  //         },
  //         grid: { display: false }
  //       }
  //     }
  //   };
  // }

  projectWiseResourceCountGraph(): void {
     const fullPath = this.router.url;
      this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any; }) => {
        const projectid = params['id'];
        if (!projectid) {
          // console.warn('No project id in query params');
          this.projectResourceData = [];
          return;
        }

        this.http.getData(`ProjectManagementGraph/project/resource-summary/${projectid}`).pipe(takeUntil(this.destroy$)).subscribe({
       
          next: (res: any) => {
            // this.projectResourceData.get('clientName')?.enable();
            this.projectResourceData = Array.isArray(res?.data) ? res.data : [];
          },
          error: (err) => {
            console.error('Error fetching clients:', err);
          }
        });
          });
    }
  

  // Department wise Contribution
  departmentWiseContributionGraph() {
    this.departmentContributionData = {
      labels: ['BA Team', 'Design Team', 'Development Team', 'Testing Team', 'DevOps Team', 'Sales Team'],
      datasets: [
        {
          data: [40.2, 33, 44.5, 50, 50, 60],
          backgroundColor: ['#FF6E06', '#EA267A', '#0F358A', '#22D235', '#25BBFF', '#1D79E6'],
          hoverBackgroundColor: ['#FFB74D', '#F06292', '#5C6BC0', '#81C784', '#26A69A', '#64B5F6']
        }
      ]
    };

    this.departmentContributionOptions = {
      cutout: '75%',
      plugins: {
        legend: { position: 'right', labels: { usePointStyle: true } },
      },
    };
  }

  // Estimated vs Actual Hours (Grouped Bar)
  estimatedActualChart() {
    this.estimatedVsActualData = {
      labels: ['Softkill E-commerce', 'Admin App', 'E-commerce', 'Web app', 'Mobile App'],
      datasets: [
        {
          label: 'Estimated Hours',
          backgroundColor: '#1A237E',
          data: [850, 950, 700, 880, 900],
          stack: 'Estimated' // separate stack
        },
        {
          label: 'Actual Hours',
          backgroundColor: '#90CAF9',
          data: [800, 700, 450, 850, 700],
          stack: 'ActualOverdue' // stacked with Overdue
        },
        {
          label: 'Over Due',
          backgroundColor: '#FF5252',
          data: [100, 0, 0, 80, 0],
          stack: 'ActualOverdue' // stacked on top of Actual
        }
      ]
    };

    this.estimatedVsActualOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          stacked: false, // show two separate bars per project (Estimated vs Actual+Overdue)
          grid: { display: false },
          title: { display: false }
        },
        y: {
          stacked: true, // stack Actual + Overdue vertically
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          },
        }
      }
    };
  }

  // Billable vs Non-Billable Hours (Stacked Bar)
  billableChart() {
    this.billableData = {
      labels: ['Project Management', 'Development', 'Design', 'QA'],
      datasets: [
        {
          label: 'Billable',
          backgroundColor: '#283593',
          data: [900, 600, 700, 500],
        },
        {
          label: 'Non-Billable',
          backgroundColor: '#9FA8DA',
          data: [300, 200, 150, 100],
        },
      ],
    };
    this.billableOptions = {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Hours' } },
      },
      plugins: {
        legend: {
          display: false
        }
      },
    };
  }

  // Project Burndown Chart (Line)
  burnDownChart() {
    this.burndownData = {
      labels: ['1', '5', '10', '15', '20', '25', '30'],
      datasets: [
        {
          label: 'E-commerce',
          data: [500, 480, 400, 300, 200, 120, 100],
          borderColor: '#FFD54F',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Admin App',
          data: [300, 280, 200, 180, 220, 260, 300],
          borderColor: '#E91E63',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'E-commerce (Softkill)',
          data: [800, 750, 700, 600, 500, 400, 300],
          borderColor: '#2196F3',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Web app',
          data: [400, 390, 380, 300, 250, 200, 180],
          borderColor: '#4CAF50',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Mobile App',
          data: [100, 120, 110, 100, 90, 80, 70],
          borderColor: '#FFEB3B',
          fill: false,
          tension: 0.3,
        },
      ],
    };
    this.burndownOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: { title: { display: true, text: 'Days of Month' } },
        y: { title: { display: true, text: 'No. of Hours' }, beginAtZero: true },
      },
    };
  }

  createGaugeChart() {
    // Create 10 colored segments for smoother gradient effect
    const dataValues = new Array(10).fill(10);
    const colors = [
      '#e53935', '#ef5350', '#fbc02d', '#ffee58',
      '#c6ff00', '#9ccc65', '#8bc34a', '#66bb6a',
      '#43a047', '#2e7d32'
    ];

    this.gaugeData = {
      datasets: [
        {
          data: dataValues,
          backgroundColor: colors,
          borderWidth: 0,
          circumference: 180,
          rotation: -90,
          cutout: '75%',
        }
      ]
    };

    this.gaugeOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      rotation: -90,
      circumference: 180,
    };
  }

  // calculate needle rotation based on % value
  getNeedleRotation(): string {
    const angle = (this.completionRate / 100) * 180 - 90;
    return `rotate(${angle}deg)`;
  }
}