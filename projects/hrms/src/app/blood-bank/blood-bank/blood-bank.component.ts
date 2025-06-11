import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { filter, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
@Component({
  selector: 'app-blood-bank',
  imports: [CommonModule, FormsModule, TranslateModule, TabsModule, Skeleton, NoDataFoundComponent, NgbPopoverModule, ModuleInformationComponent],
  templateUrl: './blood-bank.component.html',
  styleUrl: './blood-bank.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class BloodBankComponent implements OnInit {
  subscription!: Subscription
  bloodBankData: any;
  searchTerm: any = '';
  shimmer = false;
  filteredBloodBankData: any[] = [];
  selectedBloodGroup: string = 'A+'; // Default tab
  bloodGroups = [
    { group: 'A+', count: 0, bgColor: 'rgba(184, 58, 52, 0.1)', textColor: '#B83A34' },
    { group: 'A-', count: 0, bgColor: 'rgba(242, 100, 25, 0.1)', textColor: '#F26419' },
    { group: 'B+', count: 0, bgColor: 'rgba(74, 153, 74, 0.1)', textColor: '#4A994A' },
    { group: 'B-', count: 0, bgColor: 'rgba(112, 209, 112, 0.1)', textColor: '#70D170' },
    { group: 'AB+', count: 0, bgColor: 'rgba(51, 107, 153, 0.1)', textColor: '#336B99' },
    { group: 'AB-', count: 0, bgColor: 'rgba(93, 154, 217, 0.1)', textColor: '#5D9AD9' },
    { group: 'O+', count: 0, bgColor: 'rgba(196, 128, 58, 0.1)', textColor: '#C4803A' },
    { group: 'O-', count: 0, bgColor: 'rgba(255, 147, 11, 0.1)', textColor: '#FF930B' }
  ];
  moduleinfo: any;

  constructor(public router: Router,
    private http: HttpService, public formValidation: FormValidationService,) { }

  ngOnInit(): void {
    this.getBloodbank();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/blood-bank': MODULE_INFOS.Bloodbank_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getBloodbank() {
    this.shimmer = true;
    this.subscription = this.http.getData(`EmployeeData/ActiveEmployees`).subscribe({
      next: (data: any) => {
        this.bloodBankData = data;
        this.updateBloodGroupCounts();
        this.applyInitialFilter();
        this.shimmer = false;
      },
      error: (reason) => {
        console.error('Error fetching employee data:', reason)
        this.shimmer = false;
      },
      complete: () => {
        this.shimmer = false;
      }
    });
  }

  applyInitialFilter() {
    this.filteredBloodBankData = this.bloodBankData.filter(
      (emp: any) => emp.bloodGroup === this.selectedBloodGroup
    );
  }

  filterByBloodGroup(group: string) {
    this.selectedBloodGroup = group;
    this.filteredBloodBankData = this.bloodBankData.filter(
      (emp: any) => emp.bloodGroup === group
    );
  }

  updateBloodGroupCounts() {
    this.bloodGroups.forEach(bg => {
      bg.count = this.bloodBankData.filter((emp: any) => emp.bloodGroup === bg.group).length;
    });
  }

  getGroupStyle(group: string) {
    return this.bloodGroups.find(bg => bg.group === group);
  }

  filteredBloodDetails() {
    this.shimmer = false
    const filtered = this.bloodBankData
      .filter((item: any) => item.bloodGroup) // show only items with a blood group
      .filter((item: any) => {
        if (!this.searchTerm) return true;
        const term = this.searchTerm.toLowerCase().trim();
        // Clean and normalize name fields
        const firstName = item.firstName?.toLowerCase().trim() || '';
        const middleName = item.middleName?.toLowerCase().trim() || '';
        const lastName = item.lastName?.toLowerCase().trim() || '';
        // Combine full name
        const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
        // Prepare other searchable fields
        const email = item.workEmail?.toLowerCase().trim() || '';
        const bloodGroup = item.bloodGroup?.toLowerCase().trim() || '';
        return fullName.includes(term) || email.includes(term) || bloodGroup.includes(term);
      });
    // Sort alphabetically by full name
    return filtered.sort((a: any, b: any) => {
      const nameA = `${a.firstName} ${a.middleName || ''} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.middleName || ''} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }
}