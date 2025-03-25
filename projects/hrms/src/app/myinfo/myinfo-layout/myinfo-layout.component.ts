import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileInfoDetailsComponent } from '../../shared/profile-info-details/profile-info-details.component';
import { MyInfoPersonalTabsComponent } from '../../shared/myinfo-tabs/my-info-personal-tabs/my-info-personal-tabs.component';
import { MyinfoJobTabsComponent } from "../../shared/myinfo-tabs/myinfo-job-tabs/myinfo-job-tabs.component";
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-myinfo-layout',
  imports: [CommonModule, RouterOutlet, Select, ProfileInfoDetailsComponent, MyInfoPersonalTabsComponent, MyinfoJobTabsComponent],
  templateUrl: './myinfo-layout.component.html',
  styleUrl: './myinfo-layout.component.scss'
})
export class MyinfoLayoutComponent {
  activeButton!: string;
  activeSideNav!: string;
  activeItem!: string;
  rmData = [
    { name: 'Rajesh', designation: 'Software Engineer', team: 'Development', location: 'Bangalore' }]
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}
