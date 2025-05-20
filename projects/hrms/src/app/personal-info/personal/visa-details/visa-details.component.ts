import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';

@Component({
  selector: 'app-visa-details',
  imports: [NoDataFoundComponent, CommonModule, ReactiveFormsModule, TranslateModule, Select, DateformatPipe, DataLoaderContentComponent],
  templateUrl: './visa-details.component.html',
  styleUrl: './visa-details.component.scss'
})

export class VisaDetailsComponent implements OnInit,OnDestroy {
  subscription!: Subscription;
  empinfo: any;
  visa = [] as any;
  visaData = [] as any;
  Countrydetails: any;
  spinnerLoader=false
  visaForm!: FormGroup;
  visaupdateForm!:FormGroup;
  currentDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  dateofbirth: any;
  allCountries: any; 
  selecteVisaId: any;
  selectedvisaDetails: any;
  loading=false
  employedata: any;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService,public rbac: RbacService,public formValidation: FormValidationService,public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }
  ngOnInit(): void {
   this.getEmpInfoFromRoute();
    this.getCountry();
    this.getvisatype();
   
    this.intitionfrom()
    this.intitionupdatefrom()
    this.visaForm.get('issueddate')?.valueChanges.subscribe(() => {
      this.visaForm.get('expirydate')?.reset();
    });
    this.visaupdateForm.get('issueddate')?.valueChanges.subscribe(() => {
      this.visaupdateForm.get('expirydate')?.reset();
    });
    
  }

 
  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
       this.getVisaEmpId()
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
       this.getVisaEmpId()
    }
  }

  intitionfrom(){
    this.visaForm = this.fb.group({
      visatype: [null, Validators.required],
      countryname:[null,Validators.required],
      issueddate: [null, Validators.required],
      expirydate: [null, Validators.required],
      notes: [''],
    });
  }

  
  intitionupdatefrom(){
    this.visaupdateForm = this.fb.group({
      visatype: [null, Validators.required],
      countryname:[null,Validators.required],
      issueddate: [null, Validators.required],
      expirydate: [null, Validators.required],
      notes: [''],
    });
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata=data
        this.dateofbirth =this.formatDateToLocal(data.dob)
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  
  getvisatype() {
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
    this.loading=true
    this.subscription = this.http.getData(`Visa/${this.empinfo.employeeId}`).subscribe({
      next: (data: any) => {
        this.loading=false
        this.visaData = data.map((visa: { issueddate: string; expirydate: string; }) => ({
          ...visa,
          issueddate: this.formatDateToLocal(visa.issueddate),
          expirydate: this.formatDateToLocal(visa.expirydate),
          status: moment().isAfter(moment(visa.expirydate)) ? 'Inactive' : 'Active',
        }));
      },
      error: (err) => {
        this.loading=false
        console.error('Error fetching visa data:', err);
      },
    });
  }
  getMinEndDate(): string | null {
    const startDateValue = this.visaForm.get('issueddate')?.value;
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null; // Return null if no start date is selected
  }

  getupdateMinEndDate(): string | null {
    const startDateValue = this.visaupdateForm.get('issueddate')?.value;
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null; 
  }

   formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size:'lg', backdrop: 'static' });
  }

  postvisa() {
    if (this.visaForm.invalid)
       return;
  
    this.spinnerLoader = true;
    const formValue = this.visaForm.value;
    const payload = {
      visatype: formValue.visatype,
      issueddate: formValue.issueddate,
      expirydate: formValue.expirydate,
      employeeId: this.empinfo.employeeId, // set or get dynamically
      issuedcountry: formValue.countryname,
      vstatus: 'Active',
      note:formValue.note
    };
  
    this.http.postdata('Visa',payload).subscribe({
      next: (res) => {
        this.visaForm.reset()
        this.spinnerLoader = false;
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Visa details added successfully")
        this.getVisaEmpId()
        // handle success
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal("Visa details added failed")
      }
    });
  }

  opendeletModal(content: any, visaDetails: any): void {
    this.selecteVisaId = visaDetails.id;
    this.selectedvisaDetails = visaDetails;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  visaDelete() {
    if (!this.selecteVisaId || !this.selectedvisaDetails) {
      console.error('No education record selected for deletion');
      return;
    }
    const payload = {
      status: 'Void',
      id: this.selectedvisaDetails.id,
      employeeId: this.selectedvisaDetails.employeeId,
      visatype: this.selectedvisaDetails.visatype1,
      expirydate: this.selectedvisaDetails.expirydate,
      issueddate: this.selectedvisaDetails.issueddate,
      issuedcountry: this.selectedvisaDetails.issuedcountry,
      notes: this.selectedvisaDetails.notes,
      degreeEndDate: this.selectedvisaDetails.degreeEndDate,
    };
    // Send the delete request
    this.subscription = this.http.postdata('Visa/UPDATER', payload).subscribe({
      next: (data: any) => {
       
        this.modalService.dismissAll()
        this.getVisaEmpId();
        this.conformationPopup.openSuccessModal('Visa details deleted successfully');
      },
      error: (err: any) => {
        console.error('Error deleting education record:', err);
        this.conformationPopup.openErrorModal('Visa details deleted failed');
      }
    });
  }
  openModalupdate(content: any, visaDetails: any): void {
    this.selecteVisaId=visaDetails.id

    this.visaupdateForm.patchValue({
      visatype: visaDetails.visatype,         // assuming value is "B1", "H1B", etc.
      countryname: visaDetails.issuedcountry, // make sure the value matches the `optionValue`
      issueddate: this.formatDateToLocal(visaDetails.issueddate),
      expirydate: this.formatDateToLocal(visaDetails.expirydate),
      notes: visaDetails.notes || ''          // default to empty if notes are null/undefined
    });
   
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updatevisa() {
    if (this.visaupdateForm.invalid)
       return;
  
    this.spinnerLoader = true;
    const formValue = this.visaupdateForm.value;
    const payload = {
      id:this.selecteVisaId,
      visatype: formValue.visatype,
      issueddate: formValue.issueddate,
      expirydate: formValue.expirydate,
      employeeId: this.empinfo.employeeId,
      issuedcountry: formValue.countryname,
      vstatus: 'Active',
      note:formValue.note
    };
  
    this.http.postdata('Visa/UPDATER',payload).subscribe({
      next: (res) => {
        this.spinnerLoader = false;
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Visa details updated successfully")
        this.getVisaEmpId()
        // handle success
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal("Visa details updated failed")
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
