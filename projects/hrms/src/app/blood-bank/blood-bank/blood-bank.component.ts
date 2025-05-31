import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-blood-bank',
  imports: [CommonModule,FormsModule, TranslateModule,TabsModule],
  templateUrl: './blood-bank.component.html',
  styleUrl: './blood-bank.component.scss'
})
export class BloodBankComponent {
   subscription!: Subscription
   bloodBankData:any;
    searchTerm: any = '';
   constructor(public router: Router,
    private http: HttpService, public formValidation: FormValidationService,) { }

  ngOnInit(): void {
    this.getBloodbank();
  }

  getBloodbank(){
    this.subscription = this.http.getData(`EmployeeData/ActiveEmployees`).subscribe({
      next: (data: any) => {
        this.bloodBankData = data;
        console.log('blooddetails', this.bloodBankData);
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  
filteredBloodDetails() {
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



