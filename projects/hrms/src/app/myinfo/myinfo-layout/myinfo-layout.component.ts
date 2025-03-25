import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileInfoDetailsComponent } from '../../shared/profile-info-details/profile-info-details.component';
import { MyInfoPersonalTabsComponent } from '../../shared/myinfo-tabs/my-info-personal-tabs/my-info-personal-tabs.component';
import { MyinfoJobTabsComponent } from "../../shared/myinfo-tabs/myinfo-job-tabs/myinfo-job-tabs.component";


@Component({
  selector: 'app-myinfo-layout',
  imports: [CommonModule, RouterOutlet, ProfileInfoDetailsComponent, MyInfoPersonalTabsComponent, MyinfoJobTabsComponent],
  templateUrl: './myinfo-layout.component.html',
  styleUrl: './myinfo-layout.component.scss'
})
export class MyinfoLayoutComponent {
  activeButton!: string;
  activeSideNav!: string;
  activeItem!: string;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}
