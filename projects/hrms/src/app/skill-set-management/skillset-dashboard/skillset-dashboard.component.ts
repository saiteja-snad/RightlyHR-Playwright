import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule, ChartModule, RouterModule, CardModule],
  templateUrl: './skillset-dashboard.component.html',
  styleUrl: './skillset-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SkillsetDashboardComponent {
  // summary cards
  summaryCards = [
    { title: 'Total Employee Count', value: 128, subtext: '↑ +12 vs last month', subtextClass: 'green' },
    { title: 'Employees Commited Count', value: 452, subtext: '↑ +5 New Hires', subtextClass: 'green' },
    { title: 'Employees Available Count', value: 4.2, subtext: '✓ On target', subtextClass: 'green' },
    { title: 'Soon to be Available', value: 'JavaScript', subtext: '👥 78 Employees', subtextClass: '' }
  ];
  // skill level variables
  skillLevelData: any;
  skillLevelOptions: any;
  totalSkillLevelCount: any;
  // skill by Department valribale
  skillByDepartmentData: any;
  skillByDepartmentOptions: any;
  // top Skill variables
  topSkillsData: any;
  topSkillsOptions: any;

  ngOnInit() {
    this.skilllevelGraph();
    this.skillByDepartmentGraph();
    this.topSkillsGraph();
  }

  // Skill level graph
  skilllevelGraph() {
    this.skillLevelData = {
      datasets: [
        {
          data: [20, 30, 15],
          backgroundColor: ['#FF9800', '#E91E63', '#3F51B5'],
        }
      ]
    };

    this.skillLevelOptions = {
      cutout: '60%',
      plugins: {
        legend: { display: false },
      },
    };
  }

  // Skill level graph
  skillByDepartmentGraph() {
    this.totalSkillLevelCount = 200;
    this.skillByDepartmentData = {
      datasets: [
        {
          data: [58, 32, 19, 19],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        }
      ]
    };

    this.skillByDepartmentOptions = {
      cutout: '60%',
      plugins: {
        legend: { display: false },
      },
    };
  }

  // Top Skills graph
  topSkillsGraph() {
    this.topSkillsData = {
      labels: ['Angular', 'React', 'Node.js', 'Python', 'Java'],
      datasets: [
        {
          label: 'Number of Employees',
          data: [35, 28, 25, 20, 15],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A'],
        }
      ]
    };

    this.topSkillsOptions = {
      indexAxis: 'y', // makes the bar chart horizontal
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
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
}