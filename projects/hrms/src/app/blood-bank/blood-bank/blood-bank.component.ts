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
  shimmer = false
  moduleinfo: any

  constructor(public router: Router,
    private http: HttpService, public formValidation: FormValidationService,) { }

  ngOnInit(): void {
    this.getBloodbank();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  getBloodbank() {

    this.shimmer = true;
    this.subscription = this.http.getData(`EmployeeData/ActiveEmployees`).subscribe({
      next: (data: any) => {
        this.bloodBankData = data;
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
  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
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



