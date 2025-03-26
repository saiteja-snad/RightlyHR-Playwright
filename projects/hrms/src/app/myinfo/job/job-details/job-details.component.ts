import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-job-details',
  imports: [CommonModule, Select,ReactiveFormsModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {
  separationRequestForm!: FormGroup;
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
    this.separationRequestForm = this.fb.group({
      appliedDate: ['', Validators.required],
      jobRole: [{ value: '', disabled: true }],
      departmentName: [{ value: '', disabled: true }],
      subdepartmentName: [{ value: '', disabled: true }],
      teamManager: [{ value: '', disabled: true }],
      reportingManager: [{ value: '', disabled: true }],
      description: ['', [Validators.required, Validators.maxLength(400)]],
      isEarlyRelieving: [false],
      earlyRelievingDate: ['', Validators.required],
      reasonForEarlyRelieving: ['', [Validators.required, Validators.maxLength(400)]]
    });

    // Disable early relieving fields by default
    this.toggleEarlyRelievingFields(false);
  }

  toggleEarlyRelievingFields(isEnabled: boolean): void {
    if (isEnabled) {
      this.separationRequestForm.get('earlyRelievingDate')?.enable();
      this.separationRequestForm.get('reasonForEarlyRelieving')?.enable();
    } else {
      this.separationRequestForm.get('earlyRelievingDate')?.disable();
      this.separationRequestForm.get('reasonForEarlyRelieving')?.disable();
    }
  }

  onCheckEarlyRelieving(): void {
    const isEarlyRelieving = this.separationRequestForm.get('isEarlyRelieving')?.value;
    this.toggleEarlyRelievingFields(isEarlyRelieving);
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }
}
