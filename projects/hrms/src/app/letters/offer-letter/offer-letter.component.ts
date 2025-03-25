import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";
import { Select } from 'primeng/select';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { CountryCodePhoneNumberComponent } from "../../shared/country-code-phone-number/country-code-phone-number.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-offer-letter',
  imports: [CommonModule, LettersTabComponent, Select, CountryCodePhoneNumberComponent, ReactiveFormsModule],
  templateUrl: './offer-letter.component.html',
  styleUrl: './offer-letter.component.scss',
})

export class OfferLetterComponent {
  selectedCountryConfig = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true
  };
  phoneNumber: string = '';
  employeeForm!: FormGroup;
  employees = [{ name: 'John Doe', id: 1 }, { name: 'Jane Smith', id: 2 }];
  employeementType = [{ name: 'Permanent' }, { name: 'Contract' }];
  location = [{ name: 'New York' }, { name: 'Los Angeles' }];
  sublocation = [{ name: 'Branch 1' }, { name: 'Branch 2' }];

  selectedEmployee: any;
  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      searchEmployee: [null, Validators.required],
      personalEmail: ['', [Validators.required, Validators.email]],
      salutation: [null, Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      gender: [null, Validators.required],
      selectAddress: [null, Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      designation: ['', Validators.required],
      esic: [null, Validators.required],
      pf: [null, Validators.required],
      salary: ['', Validators.required],
      variablePay: [null, Validators.required],
      variableAmount: ['', Validators.required],
      workLocation: [null, Validators.required],
      subLocation: [null, Validators.required],
      offerIssuedDate: ['', Validators.required],
      expectedStartDate: ['', Validators.required],
      documentType: [null, Validators.required],
      offerExpiryDate: ['', Validators.required],
      note: [''],
      signatureAuthority: [null, Validators.required]
    });
  }

  handlePhoneChange(event: any) {
    this.employeeForm.patchValue({
      phoneNumber: event
    });
  }

  requestForApproval() {
    if (this.employeeForm.valid) {
      console.log('Request for approval:', this.employeeForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  //download document
  async downLoadDocument() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1'];
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    // this.isLoading = true;
    for (const contentId of pdfContents) {
      const pdfContent = document.getElementById(contentId);
      if (pdfContent) {
        const canvas = await html2canvas(pdfContent, { scale: 3 });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        imagesData.push({ imgData, imgHeight });
      }
    }
    // Add all images to the PDF except for the last one
    for (let i = 0; i < imagesData.length - 1; i++) {
      const imageData = imagesData[i];
      pdf.addImage(imageData.imgData, 'PNG', 0, 0, imgWidth, imageData.imgHeight, '', 'FAST');
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }
    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(lastImageData.imgData, 'PNG', 0, 0, imgWidth, lastImageData.imgHeight, '', 'FAST');
    }
    const fileName = `OfferLetter.pdf`;
    pdf.save(fileName);
  }
}
