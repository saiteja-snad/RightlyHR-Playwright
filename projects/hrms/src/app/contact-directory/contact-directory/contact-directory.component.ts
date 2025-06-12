import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { filter, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
@Component({
  selector: 'app-contact-directory',
  imports: [CommonModule, FormsModule, TranslateModule, TabsModule, Skeleton, NgbPopoverModule, ModuleInformationComponent],
  templateUrl: './contact-directory.component.html',
  styleUrl: './contact-directory.component.scss'
})
export class ContactDirectoryComponent {
  subscription!: Subscription
  contactData: any;
  moduleinfo: any
  loading: boolean = false;
  constructor(public router: Router,
    private http: HttpService, public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.getContactData();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }
  getContactData() {
    this.loading = true;
    this.subscription = this.http.getData('ContactDirectory').subscribe({
      next: (data: any) => {
        this.loading = false;
        console.log('Grouped Contact Data-1', data);
        // Group contacts by department
        const groupedData: any[] = [];

        data.forEach((item: { departmentName: any; }) => {
          let deptGroup = groupedData.find(group => group.department === item.departmentName);
          if (!deptGroup) {
            deptGroup = {
              department: item.departmentName,
              employees: []
            };
            groupedData.push(deptGroup);
          }
          deptGroup.employees.push(item);
        });

        this.contactData = groupedData;
        console.log('Grouped Contact Data', this.contactData);
      },
      error: (reason) => {
        console.error('Error fetching contact data:', reason)
        this.loading = false;

      },
    });
  }
  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/contacts-directory': MODULE_INFOS.Contact_DIRTECROTY_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }



}
