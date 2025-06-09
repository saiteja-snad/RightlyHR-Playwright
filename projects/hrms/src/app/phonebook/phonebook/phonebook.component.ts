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
import { Skeleton } from 'primeng/skeleton';
@Component({
  selector: 'app-phonebook',
  imports: [CommonModule, FormsModule, TranslateModule, TabsModule,Skeleton],
  templateUrl: './phonebook.component.html',
  styleUrl: './phonebook.component.scss'
})
export class PhonebookComponent {
  subscription!: Subscription
  phonebookData: any;
  searchphone: any = '';
  imageUrl: any;
  loaders= false;
  constructor(public router: Router,
    private http: HttpService, private sanitizer: DomSanitizer, public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.getPhoneBook();
  }

  getPhoneBook() {
    this.loaders = true;
    this.subscription = this.http.getData(`EmployeeData/TraineeActiveEmployees/Active`).subscribe({
      next: (data: any) => {
        this.loaders = false;
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
            originalProfileUrl: profilePath,
            mobilePhoneCountryCode: this.extractCountryCode(emp.mobilePhoneCountryCode),
            workPhoneCountryCode: this.extractCountryCode(emp.workPhoneCountryCode)
          };
        });

        // Step 2: Download profile pictures asynchronously
        this.phonebookData.forEach((emp: { originalProfileUrl: any; }) => {
          if (emp.originalProfileUrl) {
            this.downloadAndSetProfileImage(emp);
          }
        });
      },
      error: (reason) =>{
         console.error('Error fetching employee data:', reason)
          this.loaders = false;
      },
      complete: () => {
        this.loaders = false;
      }
    });
  }
  // extractdata
  extractCountryCode(value: string): string {
    if (!value) return '';
    // Case 1: Matches pattern like "Albania (+355)" or just "(+355)"
    const match = value.match(/\(\+?\d+\)/);
    if (match) {
      return match[0].replace(/[()]/g, '') + ' ';
    }
    // Case 2: If it’s already in +355 format or just 355
    const cleaned = value.trim();
    if (/^\+?\d+$/.test(cleaned)) {
      return cleaned.startsWith('+') ? cleaned + ' ' : '+' + cleaned + ' ';
    }
    return '';
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
    const term = this.searchphone?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
    return this.phonebookData
      .filter((emp: any) => {
        const fullName = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`
          .toLowerCase().trim().replace(/\s+/g, ' '); // normalize multiple spaces to single
        const jobRole = emp.jobRole?.toLowerCase() || '';
        return (fullName.includes(term) || jobRole.includes(term));
      })
      .sort((a: any, b: any) => a.fullName.localeCompare(b.fullName));
  }
}
