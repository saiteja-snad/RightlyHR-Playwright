import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss'
})
export class BasicInfoComponent {
  basicInfoForm!: FormGroup;
  subscription!:Subscription
  empinfo:any
  buttons=false
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.getEmployeeId(); // Fetch employee data and patch the form
  }
 
  initializeForm(): void {
    this.basicInfoForm = this.fb.group({
      employeeId: ['', Validators.required],
      salutation: [null, Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      gender: [null, Validators.required],
      dob: ['', Validators.required],
      bloodGroup: [null, Validators.required],
      maritalStatus: [null, Validators.required],
    });
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
       // this.patchForm(data);
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  // patchForm(data: any): void {
  //   this.basicInfoForm.patchValue({
  //     employeeId: data.employeeId,
  //     salutation: this.designation.find((item: any) => item.id === data.salutation),
  //     firstName: data.firstName,
  //     middleName: data.middleName,
  //     lastName: data.lastName,
  //     gender: this.employeementType.find((item: any) => item.name === data.gender),
  //     dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
  //     bloodGroup: this.location.find((item: any) => item.name === data.bloodGroup),
  //     maritalStatus: this.sublocation.find((item: any) => item.name === data.maritalStatus),
  //   });
  // }


  showButtons() {
    this.buttons = !this.buttons
  }
}
