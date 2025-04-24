import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MyExpensesTabComponent } from "../claimsandexpenses-tabs/my-expenses-tab/my-expenses-tab.component";
import { MyinfoHeaderTabsComponent } from '../myinfo-tabs/myinfo-header-tabs/myinfo-header-tabs.component';
import { PersonalinfoHeaderTabsComponent } from "../personalinfo-tabs/personalinfo-header-tabs/personalinfo-header-tabs.component";
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SettingsMainHeaderTabsComponent } from "../settings-tabs/settings-main-header-tabs/settings-main-header-tabs.component";
import { ReportsMainTabsComponent } from "../reports-tabs/reports-main-tabs/reports-main-tabs.component";
import { PmsTabsComponent } from "../pms-module-tabs/pms-tabs/pms-tabs.component";
import { PmsSettingsTabsComponent } from "../pms-module-tabs/pms-settings-tabs/pms-settings-tabs.component";
import { ItsuporrtHeaderTabsComponent } from "../itsuporrt-header-tabs/itsuporrt-header-tabs.component";
import { CalendarHeaderTabsComponent } from "../calendar-tabs/calendar-header-tabs/calendar-header-tabs.component";
import { TimeOffTabsComponent } from "../time-off-module-tabs/time-off-tabs/time-off-tabs.component";

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, MyExpensesTabComponent, MyinfoHeaderTabsComponent, PersonalinfoHeaderTabsComponent, SettingsMainHeaderTabsComponent,
    ReportsMainTabsComponent, PmsTabsComponent, PmsSettingsTabsComponent, ItsuporrtHeaderTabsComponent, CalendarHeaderTabsComponent, TimeOffTabsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {
  empinfo: any;
  imageUrl: any;
  subscription!: Subscription;

  constructor(public readonly router: Router, private http: HttpService, private sanitizer: DomSanitizer) { }

  events = [
    { name: "John Doe's (SD153462) Birthday", time: '1 hour ago', type: 'birthday' },
    { name: "Jane's (SD164732) Anniversary", time: '3 hours ago', type: 'anniversary' },
    { name: 'Team Meeting with HR', time: '1 day ago', type: 'meeting' },
    { name: 'Holiday', time: '1 day ago', type: 'holiday' },
  ];

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.imageUrl = this.empinfo.profileUrl;
    this.onSelectprofilePicDownload(this.empinfo);
  }

  onSelectprofilePicDownload(employee: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', employee.profileUrl).subscribe({
      next: (res: any) => {
        let blob = new Blob([res['body']], { type: 'image/png' });
        let objectURL = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (reason) => {
        //console.log(reason),
      }
    });
  }

  // Define colors based on event types
  getEventClass(type: string): string {
    switch (type) {
      case 'birthday':
        return 'birthday-event';
      case 'anniversary':
        return 'anniversary-event';
      case 'holiday':
        return 'holiday-event';
      default:
        return 'other-event'; // Custom class for Other events
    }
  }

  navigateSettings() {
    this.router.navigate(['/settings'])
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  showPmsTabs(): boolean {
    const includeRoutes = [
      '/pms/review-cycle',
      '/pms/review-cycle/create',
      '/pms/review-cycle/update',
      '/pms/review-cycle/view',
      '/pms/apprisal',
      '/pms/assessment-form',
      '/pms/myPerformance/pending-review',
      '/pms/myPerformance/completed-review',
      '/pms/team-performance/pending-review',
      '/pms/team-performance/completed-review',
    ];
    return includeRoutes.includes(this.router.url);
  }

  showPmsConfigurationTabs(): boolean {
    const includeRoutes = [
      '/pmsconfiguration/assessor',
      '/pmsconfiguration/increment',
    ];
    return includeRoutes.includes(this.router.url);
  }
}