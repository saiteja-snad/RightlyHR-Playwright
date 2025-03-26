import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-education-details',
  imports: [CommonModule,Select,ReactiveFormsModule],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})
export class EducationDetailsComponent {
  educationForm!: FormGroup;
  currentDate = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  showError = false;
  showErrors = false;
  issStartDateValid = true;
  issEndDateValid = true;
  islistedItem = true;
  buttondisable = true;
  educationtypes=[
    {id:1,name:'SSC'},]
  constructor(private modalService: NgbModal,private fb: FormBuilder) {}
  ngOnInit(): void {
    this.initializeForm();
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  initializeForm(): void {
    this.educationForm = this.fb.group({
      education: ['', Validators.required],
      university: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      specialization: ['',[Validators.required, Validators.pattern('^[^\\s].*$')],],
      gpa: ['',[Validators.required, Validators.min(1), Validators.max(10)],],
      degreeStartDate: ['', Validators.required],
      degreeEndDate: ['', Validators.required],
      attachment: ['', Validators.required],
    });

    // Add validation for start and end dates
    this.educationForm.get('degreeStartDate')?.valueChanges.subscribe((startDate) => {
      const endDate = this.educationForm.get('degreeEndDate')?.value;
      this.issStartDateValid = new Date(startDate) <= new Date(this.currentDate);
      if (endDate) {
        this.issEndDateValid = new Date(endDate) > new Date(startDate);
      }
    });

    this.educationForm.get('degreeEndDate')?.valueChanges.subscribe((endDate) => {
      const startDate = this.educationForm.get('degreeStartDate')?.value;
      this.issEndDateValid = new Date(endDate) > new Date(startDate);
    });
  }

  onSubmit(): void {
    if (this.educationForm.valid) {
      console.log('Form Submitted:', this.educationForm.value);
      // Call your API or service here
    } else {
      console.log('Form is invalid');
    }
  }

  onChangeEducation(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      this.showError = !allowedExtensions.includes(fileExtension || '');
      this.showErrors = fileSizeInMB > 25;
    }
  }

}
