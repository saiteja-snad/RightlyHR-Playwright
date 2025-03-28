import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';


@Component({
  selector: 'app-address-info',
  imports: [CommonModule, ReactiveFormsModule, ],
  templateUrl: './address-info.component.html',
  styleUrl: './address-info.component.scss'
})
export class AddressInfoComponent {
  buttons= false;

  basicInfoForm!: FormGroup;
  subscription!:Subscription
  empinfo:any
  bloodGroups = [
    { name: 'A+' },
    { name: 'A-' },
    { name: 'B+' },
    { name: 'B-' },
    { name: 'AB+' },
    { name: 'AB-' },
    { name: 'O+' },
    { name: 'O-' }
  ];


  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.getEmployeeId();
  
    this.basicInfoForm.disable();
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
       this.patchForm(data);
      },
      error: (reason:any) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {
    this.basicInfoForm.patchValue({
      employeeId: data.employeeId,
      
    });
  }




  showButtons(): void {
    this.buttons = !this.buttons;

    if (this.buttons) {
        // Enable the form when the user clicks "Edit"
        this.basicInfoForm.enable();
    } else {
        // Disable the form when the user clicks "Close"
        this.basicInfoForm.disable();
    }
}

  
}
