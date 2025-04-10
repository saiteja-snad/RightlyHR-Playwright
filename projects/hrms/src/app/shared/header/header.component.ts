import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TimeOffTabsComponent } from '../time-off-tabs/time-off-tabs.component';
import { MyExpensesTabComponent } from "../claimsandexpenses-tabs/my-expenses-tab/my-expenses-tab.component";
import { MyinfoHeaderTabsComponent } from '../myinfo-tabs/myinfo-header-tabs/myinfo-header-tabs.component';
import { PersonalinfoHeaderTabsComponent } from "../personalinfo-tabs/personalinfo-header-tabs/personalinfo-header-tabs.component";
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, TimeOffTabsComponent, MyExpensesTabComponent, MyinfoHeaderTabsComponent, PersonalinfoHeaderTabsComponent],
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
    console.log(employee);
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', employee.profileUrl)
      .subscribe({
        next: (res: any) => {
          console.log(res)
          let blob = new Blob([res['body']], { type: 'image/png' });
          console.log(blob);
          let objectURL = URL.createObjectURL(blob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          console.log(this.imageUrl);
        },
        error: (reason) => console.log(reason),
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

  navigateSettings(){
    this.router.navigate(['/settings'])
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}