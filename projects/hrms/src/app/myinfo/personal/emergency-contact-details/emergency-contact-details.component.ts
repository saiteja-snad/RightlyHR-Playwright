import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IRelation } from '../../../Interfaces/personal-modal';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-emergency-contact-details',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './emergency-contact-details.component.html',
  styleUrl: './emergency-contact-details.component.scss'
})
export class EmergencyContactDetailsComponent {

  subscription!: Subscription
  buttons = false;
  buttons2 = false;
  familyRelations: IRelation[] = [];
  emergencyContactForm!: FormGroup;
  empinfo: any
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
    this.getFamilyRelations();
    this.initializeForm();
    this.emergencyContactForm.disable(); // Disable the form initially
  }

  initializeForm(): void {
    this.emergencyContactForm = this.fb.group({
      contact1Name: ['', Validators.required],
      contact1Email: ['', [Validators.required, Validators.email]],
      contact1Phone: ['', Validators.required],
      contact1Relationship: ['', Validators.required],
      contact2Name: ['', Validators.required],
      contact2Email: ['', [Validators.required, Validators.email]],
      contact2Phone: ['', Validators.required],
      contact2Relationship: ['', Validators.required],
    });
  }
  showButtons() {
    this.buttons = !this.buttons
  }
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empinfo = data;
        this.patchForm(data);
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  patchForm(data: any): void {
    const contact1Relationship = this.familyRelations.find(
      (relation) => relation.relationship1 === data.relationShip
    ) || null;
  
    const contact2Relationship = this.familyRelations.find(
      (relation) => relation.relationship1 === data.relationship1
    ) || null;
    this.emergencyContactForm.patchValue({
      contact1Name: data.emergencyName || '', // Bind first emergency contact name
      contact1Email: data.emailId || '',      // Bind first emergency contact email
      contact1Phone: data.mobileNumber || '', // Bind first emergency contact phone
      contact1Relationship:contact1Relationship || '', // Bind first emergency contact relationship
      contact2Name: data.emergencyName1 || '', // Bind second emergency contact name
      contact2Email: data.emergencyEmail1 || '', // Bind second emergency contact email
      contact2Phone: data.emergencyNumber1 || '', // Bind second emergency contact phone
      contact2Relationship: contact2Relationship  || '', // Bind second emergency contact relationship
    });
  }

  enableForm(): void {
    this.buttons = true;
    this.emergencyContactForm.get('contact1Name')?.enable();
    this.emergencyContactForm.get('contact1Email')?.enable();
    this.emergencyContactForm.get('contact1Phone')?.enable();
    this.emergencyContactForm.get('contact1Relationship')?.enable();

  }

  disableForm(): void {
    this.buttons = false;
    this.buttons2 = false;
    this.emergencyContactForm.disable();
  }

  enableForm2(): void {
    this.buttons2 = true;
    this.emergencyContactForm.get('contact2Name')?.enable();
    this.emergencyContactForm.get('contact2Email')?.enable();
    this.emergencyContactForm.get('contact2Phone')?.enable();
    this.emergencyContactForm.get('contact2Relationship')?.enable();
  }
  saveForm(): void {
    const formValue = this.emergencyContactForm.value;
    const updatePayload = {
      employeeId: this.empinfo.employeeId,
      title: this.empinfo.title || null,
      firstName: this.empinfo.firstName,
      middleName: this.empinfo.middleName,
      lastName: this.empinfo.lastName,
      gender: this.empinfo.gender || null,
      dob: this.empinfo.dob,
      bloodGroup: this.empinfo.bloodGroup || null,
      maritalStatus: this.empinfo.maritalStatus || null,
      empStatus: this.empinfo.empstatus,
      emailaddress: this.empinfo.emailaddress || null,
      workEmail: this.empinfo.workEmail || null,
      contactnumber: this.empinfo.contactnumber || null,
      workPhone: this.empinfo.workPhone || null,
      emergencyName: formValue.contact1Name || this.empinfo.emergencyName,
      emailId: formValue.contact1Email || this.empinfo.emailId,
      relationShip: this.emergencyContactForm.get('contact1Relationship')?.value?.relationship1 || this.empinfo.relationShip,
      mobileNumber: formValue.contact1Phone || this.empinfo.mobileNumber,
      emergencyName1: formValue.contact2Name || this.empinfo.emergencyName1,
      emergencyEmail1: formValue.contact2Email || this.empinfo.emergencyEmail1,
      emergencyNumber1: formValue.contact2Phone || this.empinfo.emergencyNumber1,
      relationship1: this.emergencyContactForm.get('contact2Relationship')?.value?.relationship1 || this.empinfo.relationship1,
    };


    this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
      .subscribe({
        next: (data: any) => {
          console.log('Data updated successfully:', data);
          this.modalService.dismissAll();
          this.buttons = false;
          this.buttons2 = false;
          this.conformationPopup.openSuccessModal('Emergency Contact Details updated successfully');
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('Emergency Contact Details update failed');
        },
      });
  }


  //get family relations dropdown
  getFamilyRelations() {
    this.subscription = this.http
      .getData('Relationship?isDependent=true')
      .subscribe({
        next: (data: any) => {
          this.familyRelations = data as IRelation[];
        },
      });
  }
}
