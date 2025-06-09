import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
@Component({
  selector: 'app-contact-directory',
  imports: [CommonModule, FormsModule, TranslateModule, TabsModule,Skeleton],
  templateUrl: './contact-directory.component.html',
  styleUrl: './contact-directory.component.scss'
})
export class ContactDirectoryComponent {
  subscription!: Subscription
  contactData: any;
  loading: boolean = false;
  constructor(public router: Router,
    private http: HttpService, public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.getContactData();
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
    error: (reason) =>{ console.error('Error fetching contact data:', reason)
      this.loading = false;
    
    },
  });
}



}
