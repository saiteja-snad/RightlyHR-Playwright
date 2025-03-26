import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-previous-experince',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './previous-experince.component.html',
  styleUrl: './previous-experince.component.scss'
})
export class PreviousExperinceComponent {
  employeeExperienceForm!: FormGroup;
  JobtypeDetails = []; // Populate this with your job type details
  countryCodes = []; // Populate this with your country codes
  isCurrentdateDisable = false;
  isDisabletoDate = false;
  disableFromandtovalidationbutton = false;
  isFutureDate = false;
  isInvalidToDate = false;
  showError = false;
  showErrorr = false;
  employeementType: { id: number; name: string }[] = [
    { id: 1, name: 'Full-Time' },
    { id: 2, name: 'Part-Time' },
    { id: 3, name: 'Contract' },
    { id: 4, name: 'Internship' }
  ];

  designation: { id: number; name: string }[] = [
    { id: 1, name: 'Software Engineer' },
    { id: 2, name: 'Project Manager' },
    { id: 3, name: 'HR Executive' },
    { id: 4, name: 'Data Analyst' }
  ];

  location: { id: number; name: string }[] = [
    { id: 1, name: 'New York' },
    { id: 2, name: 'Los Angeles' },
    { id: 3, name: 'Chicago' },
    { id: 4, name: 'Houston' }
  ];

  sublocation: { id: number; name: string; locationId: number }[] = [
    { id: 1, name: 'Brooklyn', locationId: 1 },
    { id: 2, name: 'Downtown', locationId: 1 },
    { id: 3, name: 'Hollywood', locationId: 2 },
    { id: 4, name: 'South Side', locationId: 3 }
  ];
  constructor(private modalService: NgbModal, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }


  initializeForm(): void {
    this.employeeExperienceForm = this.fb.group({
      isPresent: [false],
      companyName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      employmentType: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      jobTitle: ['', Validators.required],
      
      previousContactName: ['', Validators.pattern('^[a-zA-Z\\s]*$')],
      previousContactNumber: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
      ],
      previousContactEmail: [
        '',
        [Validators.required, Validators.pattern('[A-Za-z0-9._+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')],
      ],
      attachment: ['', Validators.required],
    });

    // Disable "toDate" field if "isPresent" is checked
    this.employeeExperienceForm.get('isPresent')?.valueChanges.subscribe((isPresent) => {
      if (isPresent) {
        this.employeeExperienceForm.get('toDate')?.disable();
      } else {
        this.employeeExperienceForm.get('toDate')?.enable();
      }
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  currentDateValidation(): void {
    const fromDate = this.employeeExperienceForm.get('fromDate')?.value;
    const currentDate = new Date().toISOString().split('T')[0];
    this.isCurrentdateDisable = fromDate > currentDate;
  }

  toDateValidation(): void {
    const fromDate = this.employeeExperienceForm.get('fromDate')?.value;
    const toDate = this.employeeExperienceForm.get('toDate')?.value;

    if (toDate && fromDate) {
      this.isInvalidToDate = toDate < fromDate;
      this.isFutureDate = toDate > new Date().toISOString().split('T')[0];
    }
  }

  onChangeExperience(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      this.showError = !allowedExtensions.includes(fileExtension || '');
      this.showErrorr = fileSizeInMB > 25;
    }
  }

}
