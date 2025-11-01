import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-skillset-dashboard',
  imports: [CommonModule,ChartModule,RouterModule,CardModule],
  templateUrl: './skillset-dashboard.component.html',
  styleUrl: './skillset-dashboard.component.scss'
})
export class SkillsetDashboardComponent {
topSkillsData: any;
horizontalBarOptions: any;

ngOnInit() {
  this.topSkillsData = {
    labels: ['Angular', 'React', 'Node.js', 'Python', 'Java'],
    datasets: [
      {
        label: 'Number of Employees',
        data: [35, 28, 25, 20, 15],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A'],
        borderRadius: 8,
        barThickness: 15
      }
    ]
  };

  this.horizontalBarOptions = {
    indexAxis: 'y', // 👈 makes the bar chart horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
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
skillProficiencyCounts = [
  { label: 'Expert', count: 20 },
  { label: 'Intermediate', count: 30 },
  { label: 'Beginner', count: 15 }
];

deptCounts = [
  { label: 'Engineering', count: 40 },
  { label: 'Marketing', count: 25 },
  { label: 'Design', count: 15 },
  { label: 'Sales', count: 10 }
];


summaryCards = [
  { title: 'Total Employee Count', value: 128, subtext: '↑ +12 vs last month', subtextClass: 'green' },
  { title: 'Employees Commited Count', value: 452, subtext: '↑ +5 New Hires', subtextClass: 'green' },
  { title: 'Employees Available Count', value: 4.2, subtext: '✓ On target', subtextClass: 'green' },
  { title: 'Soon to be Available', value: 'JavaScript', subtext: '👥 78 Employees', subtextClass: '' }
];

skillData = {
  labels: ['Expert', 'Intermediate', 'Beginner'],
  datasets: [
    {
      data: [477, 859, 572],
      backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b']
    }
  ]
};

deptData = {
  labels: ['Engineering', 'Marketing', 'Design', 'Sales'],
  datasets: [
    {
      data: [58, 32, 19, 19],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    }
  ]
};



chartOptions = {
  plugins: {
    legend: { display: false },
  },
  cutout: '70%',
  radius: '50%',
  responsive: true,
  maintainAspectRatio: false
};

}
