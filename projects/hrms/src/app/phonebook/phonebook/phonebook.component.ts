import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-phonebook',
  imports: [CommonModule, FormsModule, TranslateModule, TabsModule],
  templateUrl: './phonebook.component.html',
  styleUrl: './phonebook.component.scss'
})
export class PhonebookComponent {
  subscription!: Subscription
  phonebookData: any;
  searchphone: any = '';
  constructor(public router: Router,
    private http: HttpService, public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.getPhoneBook();
  }

getPhoneBook() {
 this.subscription = this.http.getData(`EmployeeData/TraineeActiveEmployees/Active`).subscribe({
      next: (data: any) => {
      this.phonebookData = data.map((emp: any) => ({
        firstName: emp.firstName || '',
        middleName: emp.middleName || '',
        lastName: emp.lastName || '',
        fullName: `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim(),
        employeeId: emp.fusionEmpId || emp.employeeId,
        jobRole: emp.jobDetails?.[0]?.jobRole || 'N/A',
        workEmail: emp.workEmail || 'N/A',
        workPhone: emp.workPhone || 'N/A',
        contactNumber: emp.contactnumber || 'N/A',
        profileUrl: emp.profileUrl ||'images/alternate.png',
      }));
    },
    error: (reason) => console.error('Error fetching employee data:', reason),
  });
}


filteredPhoneDetails() {
  if (!this.phonebookData) return [];

  const term = this.searchphone?.toLowerCase() || '';

  return this.phonebookData
    .filter((emp: { fullName: string; jobRole: string; }) => {
      return (
        emp.fullName.toLowerCase().includes(term) ||
        emp.jobRole.toLowerCase().includes(term)
      );
    })
    .sort((a: { fullName: string; }, b: { fullName: any; }) => a.fullName.localeCompare(b.fullName));
}


}
