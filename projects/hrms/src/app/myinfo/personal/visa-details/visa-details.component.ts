import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Subscription } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-visa-details',
  imports: [NoDataFoundComponent,CommonModule,ReactiveFormsModule],
  templateUrl: './visa-details.component.html',
  styleUrl: './visa-details.component.scss'
})

export class VisaDetailsComponent {
    subscription!: Subscription;
  empinfo: any;
  visa = [] as any;
  visaData = [] as any;
  Countrydetails: any;
  allCountries: any; 
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService,public rbac: RbacService,public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getCountry();
    this.getvisadata();
    this.getVisaEmpId()
    
  }
  getvisadata() {
    this.subscription = this.http.getData('Visatype').subscribe({
      next: (data) => {
        this.visa = data;
      },
    });
  }


  getCountry() {
    this.subscription = this.http.getData('Country').subscribe({
      next: (data: any) => {
        this.Countrydetails = data;
        this.allCountries = this.Countrydetails.map(
          (item: { countryName: any }) => item.countryName
        );
      },
    });
  }

  getVisaEmpId(): void {
    this.subscription = this.http.getData(`Visa/${this.empinfo.employeeId}`).subscribe({
      next: (data: any) => {
        this.visaData = data.map((visa: { issueddate: string; expirydate: string; }) => ({
          ...visa,
          issueddate: this.formatDateToLocal(visa.issueddate),
          expirydate: this.formatDateToLocal(visa.expirydate),
          status: moment().isAfter(moment(visa.expirydate)) ? 'Inactive' : 'Active',
        }));
      },
      error: (err) => {
        console.error('Error fetching visa data:', err);
      },
    });
  }

   formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true,  backdrop: 'static' });
  }
}
