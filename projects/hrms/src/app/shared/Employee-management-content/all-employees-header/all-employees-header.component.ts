import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleInformationComponent } from "../../module-information/module-information.component";
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NavigationEnd, Router } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../modules-info';

@Component({
  selector: 'app-all-employees-header',
  imports: [CommonModule, TranslateModule, ModuleInformationComponent, NgbPopoverModule],
  templateUrl: './all-employees-header.component.html',
  styleUrl: './all-employees-header.component.scss'
})

export class AllEmployeesHeaderComponent implements OnInit {
  moduleinfo: string = '';
  componentname: string = '';
  routeToInfoMap!: { [key: string]: string };

  constructor(private router: Router, public rbac: RbacService) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    this.ComponentnameDisplay();
    this.routeToInfoMap = {
      '/employee-management/active-employees': MODULE_INFOS.ACTIVE_EMPLOYEES_MODULE_INFO,
      '/employee-management/inactive-employees': MODULE_INFOS.INACTIVE_EMPLOYEES_MODULE_INFO,
      '/employee-management/prospective-employees': MODULE_INFOS.PROSPECTIVE_EMPLOYEES_MODULE_INFO,
      '/employee-management/probation-employees': MODULE_INFOS.PROBATION_EMPLOYEES_MODULE_INFO,
      '/employee-management/active-interns': MODULE_INFOS.ACTIVE_TRAINEES_MODULE_INFO,
      '/employee-management/inactive-interns': MODULE_INFOS.INACTIVE_TRAINEES_MODULE_INFO,
      '/employee-management/prospective-interns': MODULE_INFOS.PROSPECTIVE_TRAINEES_MODULE_INFO,
    };
    const matchedEntry = Object.entries(this.routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  ComponentnameDisplay() {
    if (this.router.url === '/employee-management/active-employees') {
      this.componentname = 'Active Employees';
    }
    else if (this.router.url === '/employee-management/inactive-employees') {
      this.componentname = 'Inactive Employees';
    }
    if (this.router.url === '/employee-management/prospective-employees') {
      this.componentname = 'Prospective Employees';
    }
    else if (this.router.url === '/employee-management/probation-employees') {
      this.componentname = 'Probation Employees';
    }
    else if (this.router.url === '/employee-management/active-interns') {
      this.componentname = 'Active Trainees';
    }
    else if (this.router.url === '/employee-management/inactive-interns') {
      this.componentname = 'Inactive Trainees';
    }
    else if (this.router.url === '/employee-management/prospective-interns') {
      this.componentname = 'Prospective Trainees';
    }
  }
}