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
  selector: 'app-contact-directory',
  imports: [CommonModule, FormsModule, TranslateModule, TabsModule],
  templateUrl: './contact-directory.component.html',
  styleUrl: './contact-directory.component.scss'
})
export class ContactDirectoryComponent {
  subscription!: Subscription
  contactData: any;
  constructor(public router: Router,
    private http: HttpService, public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.getContactData();
  }
  getContactData() {
  this.subscription = this.http.getData(`ContactDirectory`).subscribe({
    next: (data: any) => {
      this.contactData = data.map((emp: any) => ({
        name: emp.name || '',
        emailid: emp.emailid || '',
        contactNumber: emp.contactNumber || '',
        departmentName: emp.departmentName || '',
        profileUrl: emp.profileUrl || 'assets/images/alternate.png'
      }));
    },
    error: (err) => console.error('API error:', err),
  });
}

}
