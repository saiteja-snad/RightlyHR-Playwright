import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
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
  imageUrl: any;
  constructor(public router: Router,
    private http: HttpService, private sanitizer: DomSanitizer, public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.getPhoneBook();
  }

  getPhoneBook() {
    this.subscription = this.http.getData(`EmployeeData/TraineeActiveEmployees/Active`).subscribe({
      next: (data: any) => {
        // Step 1: Map and prepare employee objects
        this.phonebookData = data.map((emp: any) => {
          const profilePath = emp.profileUrl || '';
          return {
            firstName: emp.firstName || '',
            middleName: emp.middleName || '',
            lastName: emp.lastName || '',
            fullName: `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim(),
            employeeId: emp.fusionEmpId || emp.employeeId,
            jobRole: emp.jobDetails?.[0]?.jobRole || 'N/A',
            workEmail: emp.workEmail || 'N/A',
            workPhone: emp.workPhone || 'N/A',
            contactNumber: emp.contactnumber || 'N/A',
            profileUrl: 'images/alternate.png', // default; we'll replace it below
            originalProfileUrl: profilePath, // for download use
          };
        });

        // Step 2: Download profile pictures asynchronously
        this.phonebookData.forEach((emp: { originalProfileUrl: any; }) => {
          if (emp.originalProfileUrl) {
            this.downloadAndSetProfileImage(emp);
          }
        });
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  // Download the image blob and assign it to the specific employee
  downloadAndSetProfileImage(emp: any) {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', emp.originalProfileUrl).subscribe({
      next: (res: any) => {
        const blob = new Blob([res['body']], { type: 'image/png' });
        const objectURL = URL.createObjectURL(blob);
        emp.profileUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (reason) => {
        console.warn(`Failed to download profile image for ${emp.employeeId}`, reason);
      },
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
