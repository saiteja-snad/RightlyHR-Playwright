import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { IEmployeeDetails, IEmployeeSignatures } from '../../../../letters/letters.modal';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { AuthService } from '../../../../services/auth.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { LetterFooterComponent } from '../../../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { LetterheaderonlyComponent } from "../../../../shared/letters-shared-content/letterheaderonly/letterheaderonly.component";
import { IFrequency } from '../../../../Interfaces/job-model';
import { IEAV } from '../../../../Interfaces/timoff-model';

@Component({
  selector: 'app-msa',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, TranslateModule, LetterFooterComponent, LetterheaderonlyComponent],
  templateUrl: './msa.component.html',
  styleUrl: './msa.component.scss'
})
export class MsaComponent {
  subscription!: Subscription;
  result = {} as any;
  clientForm!: FormGroup;
  selectedEmployee!: IEmployeeDetails;
  signatureAuthorityDetails: IEmployeeSignatures[] = [];
  selectedAuthority!: IEmployeeSignatures;
  clientDtails = [] as any;
  msaLetterFile!: File;
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false }
  ];
  spinnerLoader = false;
  clientId: any;
 letterFrequencies: IEAV[] = [];
  constructor(private router: Router, private fb: FormBuilder, private http: HttpService,
    private authService: AuthService, private conformationPopup: OpenModalService, public formValidation: FormValidationsService) { }

  ngOnInit() {
    this.initializeForm();
    localStorage.getItem('newlyAddedClientId');
    const clientId = localStorage.getItem('newlyAddedClientId');
    if (clientId) {
      this.clientId = clientId;
      this.getclientDetailsbyid(parseInt(clientId));
    }
    // this.getAuthorityDetails();
    this.getLetterFrequencies();
  }

  getLetterFrequencies() {
    this.subscription = this.http
      .getData('entityAttributeValues?entity=ProjectManagementLetterConfiguration&attribute=frequency')
      .subscribe({
        next: (data: any) => {
          this.letterFrequencies = data
        },
        error: (error: any) => {
          this.letterFrequencies = [];
          console.error('Error fetching letter frequencies', error);
        },
        complete: () => {
         
        },
      });
  }

  //function to get the client details
  getclientDetailsbyid(_clientId: number): void {
    const params = _clientId;
    this.subscription = this.http.getData(`Client/${params}`).subscribe({
      next: (data: any) => {
        this.clientDtails = data;
        this.clientForm.patchValue({
          companyName: this.clientDtails.data.clientName,
          companyAddress: this.clientDtails.data.address,
        });
      }, error(err) {
        console.log("error", err)
      },
    });
  }

  //form initialization
  initializeForm() {
    this.clientForm = this.fb.group({
      effectiveDate: ['', Validators.required],
      companyName: [{ value: null, disabled: true }, [Validators.required]],
      companyAddress: [''],
      documentType: ['', Validators.required],
      companyJurisdiction: ['', [Validators.required, Validators.maxLength(100)]],
      serviceProviderName: ['', [Validators.required, Validators.maxLength(100)]],
      serviceProviderNameJurisdiction: ['', [Validators.required, Validators.maxLength(100)]],
      serviceProviderAddress: ['', [Validators.required, Validators.maxLength(500)]],
      noticePeriodforTermination: ['', [Validators.required, Validators.maxLength(4)]],
      noticePeriodfrequency: ['', Validators.required],
      paymentTerms: ['', [Validators.required, Validators.maxLength(4)]],
      invoicingFrequency: ['', Validators.required],
      governingLaw: ['', [Validators.required, Validators.maxLength(500)]],
      signatureAuthority: [''],
    });
  }

  getAuthorityDetails() {
    let offertype = 'MSA Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.signatureAuthorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim()
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  async postMSALetterFormSubmit(form: FormGroup) {
    const data = form.value;
    let fileName = '';
    this.spinnerLoader = true;
    fileName = `${this.clientForm.get('companyName')?.value ?? ''}_${new Date().getTime()}_Unsigned_MSALetter.pdf`;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1', 'pdfContent2', 'pdfContent3']; // IDs of the content elements to be converted to PDF
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    // this.isLoading = true;
    for (const contentId of pdfContents) {
      const pdfContent = document.getElementById(contentId);
      if (pdfContent) {
        const canvas = await html2canvas(pdfContent, { scale: 2, useCORS: true });
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
    pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    let d: Date = new Date()
    this.msaLetterFile = new File([blob], fileName, { type: 'application/pdf', });
    this.uploadMSALetter();
  }

  uploadMSALetter() {
    const timestamp = new Date().getTime();
    // Extract filename and extension
    const originalName = this.msaLetterFile.name; // e.g. "agreement.pdf"
    const dotIndex = originalName.lastIndexOf('.');
    const fileNameWithoutExt = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    const fileExt = dotIndex !== -1 ? originalName.substring(dotIndex + 1) : '';
    // Construct final path
    const filePath = `/ProjectManagement/Clients/${this.clientId}/Letters/MSA/${fileNameWithoutExt}_${timestamp}.${fileExt}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.msaLetterFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.result.documentUrl = data.path;
          this.documentsUpload();
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload  is failed');
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  //function to upload the MSA letter to documents
  documentsUpload() {
    let loggedInUser = this.authService.getToken();
    const documentType = this.clientForm.get('documentType')?.value
    const payLoad = {
      entityType: 'client',
      entityId: parseInt(this.clientId),
      documentName: 'MSA Letter',
      type: 'Unsigned',
      documentType: 'MSA Letter',
      documentUrl: this.result.documentUrl,
      status: 'active',
      date: this.clientForm.get('effectiveDate')?.value,
      createdBy: loggedInUser.employeeId,
      updatedBy: loggedInUser.employeeId,
    };
    this.subscription = this.http.postdata('Documents', payLoad).subscribe({
      next: (data: any) => {
        if (data) {
          this.postMSAmanagementletter(data.data.documentId);
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(reason.message);
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  //function to post the MSA details to MSA management
  postMSAmanagementletter(unsignedDocRefId: any) {
    let loggedInUser = this.authService.getToken();
    const formData = this.clientForm.value;
    const attributesdata = [
      //{ key: 'effectiveDate', value: formData?.effectiveDate?.toString() ?? null, dataType: 'string' },
       { key: 'companyName', value: this.clientForm.get('companyName')?.value?.toString() ?? this.clientDtails.data.clientName, dataType: 'string',},
      { key: 'companyAddress', value: this.clientForm.get('companyAddress')?.value.toString() ?? null, dataType: 'string' },
      { key: 'companyJurisdiction', value: formData?.companyJurisdiction?.toString() ?? null, dataType: 'string' },
      { key: 'serviceProviderName', value: formData?.serviceProviderName?.toString() ?? null, dataType: 'string' },
      { key: 'serviceProviderNameJurisdiction', value: formData?.serviceProviderNameJurisdiction?.toString() ?? null, dataType: 'string' },
      { key: 'serviceProviderAddress', value: formData?.serviceProviderAddress?.toString() ?? null, dataType: 'string' },
      { key: 'noticePeriodforTermination', value: formData?.noticePeriodforTermination?.toString() ?? null, dataType: 'string' },
      { key: 'noticePeriodfrequency', value: formData?.noticePeriodfrequency?.value?.toString() ?? null, dataType: 'string' },
      { key: 'paymentTerms', value: formData?.paymentTerms?.toString() ?? null, dataType: 'string' },
      { key: 'invoicingFrequency', value: formData?.invoicingFrequency?.value?.toString() ?? null, dataType: 'int' },
      { key: 'governingLaw', value: formData?.governingLaw?.toString() ?? null, dataType: 'string' },
    ];
    const payLoad = {
      letterType: 'MSA Letter',
      effectiveDate: this.clientForm.get('effectiveDate')?.value,
      clientId: parseInt(this.clientId),
      // authorityId: this.clientForm.get('signatureAuthority')?.value?this.clientForm.get('signatureAuthority')?.value:0,
      unsignedDocumentUrl: this.result.documentUrl,
      unsignedDocRefId: unsignedDocRefId,
      createdBy: loggedInUser.employeeId,
      createdAt: moment(),
      attributes: attributesdata,
    };
    this.subscription = this.http.postdata('ProjectManagementLetter/postLetter', payLoad).subscribe({
      next: (data: any) => {
        if (data) {
          this.result.documentUrl = data.path;
          this.conformationPopup.openSuccessModal('MSA letter generated successfully')
          this.router.navigate(['/project-management/clients/add/documents'])
          this.spinnerLoader = false;
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload  is failed');
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}