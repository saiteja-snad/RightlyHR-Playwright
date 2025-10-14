import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { IEmployeeSignatures } from '../../../../letters/letters.modal';
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
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
import moment from 'moment';
import { IFrequency } from '../../../../Interfaces/job-model';
import { IEAV } from '../../../../Interfaces/timoff-model';
@Component({
  selector: 'app-nda',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, TranslateModule],
  templateUrl: './nda.component.html',
  styleUrl: './nda.component.scss'
})

export class NdaComponent {
  subscription!: Subscription;
  clientDtails = [] as any;
  signatureAuthorityDetails: IEmployeeSignatures[] = [];
  clientForm!: FormGroup;
  ndaLetterFile!: File;
  clientaddressdata: any;
  spinnerLoader = false;
  frequencyDetails: IFrequency[] = [];
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false }
  ];
  result = {} as any;
  clientId: any;
  letterFrequencies: IEAV[] = [];

  constructor(private router: Router, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService, 
    private authService: AuthService, public formValidation: FormValidationsService,) { }

  ngOnInit() {
    this.initializeForm();
    localStorage.getItem('newlyAddedClientId');
    const clientId = localStorage.getItem('newlyAddedClientId');
    if (clientId) {
      this.clientId = clientId;
      this.getclientDetailsbyid(parseInt(clientId));
    }
    this.getLetterFrequencies();
  }

  //form initialization
  initializeForm() {
    this.clientForm = this.fb.group({
      effectiveDate: ['', Validators.required],
      companyName: [{ value: '', disabled: true }, [Validators.required,Validators.maxLength(100)]],
      serviceProviderName: ['', [Validators.required,Validators.maxLength(100)]],
      serviceProviderAddress: ['', [Validators.required,Validators.maxLength(500)]],
      posttermconfidentialityduration: ['', [Validators.required,Validators.maxLength(4)]],
      governingLaw: ['',[ Validators.required,Validators.maxLength(500)]],
      termduration: ['', [Validators.required,Validators.maxLength(4)]],
      // signatureAuthority: ['', Validators.required],
      documentType: [null, Validators.required],
      companyAddress: [{ value: '', disabled: true },[Validators.required,Validators.maxLength(500)]],
      posttermconfidentialityfrequency: [null, Validators.required],
      termfrequency: [null, Validators.required],
    });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  //function to get the client details
  getclientDetailsbyid(_clientId: number): void {
    //params
    const params = _clientId;
    this.subscription = this.http.getData(`Client/${params}`).subscribe({
      next: (data: any) => {
        this.clientDtails = data;
        this.clientForm.patchValue({
          companyAddress: this.clientDtails.data.address,
          companyName: this.clientDtails.data.clientName || '',
        });
      }, error(err) {
        console.log("expensesheadererror", err)
      },
    });
  }

  getAuthorityDetails() {
    let offertype = 'NDA Letter';
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

  async postNDALetterFormSubmit(form: FormGroup) {
    const data = form.value;
    let fileName = '';
    this.spinnerLoader = true;
    fileName = `${this.clientForm.get('companyName')?.value ?? ''}_${new Date().getTime()}_Unsigned_NDALetter.pdf`;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1', 'pdfContent2']; // IDs of the content elements to be converted to PDF
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
    this.ndaLetterFile = new File([blob], fileName, { type: 'application/pdf', });
    this.uploadNDALetter();
  }

  uploadNDALetter() {
    const timestamp = new Date().getTime();
    // Extract filename and extension
    const originalName = this.ndaLetterFile.name; // e.g. "agreement.pdf"
    const dotIndex = originalName.lastIndexOf('.');
    const fileNameWithoutExt = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    const fileExt = dotIndex !== -1 ? originalName.substring(dotIndex + 1) : '';
    // Construct final path
    const filePath = `/ProjectManagement/Clients/${this.clientId}/Letters/NDA/${fileNameWithoutExt}_${timestamp}.${fileExt}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.ndaLetterFile).subscribe({
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

  //function to upload the NDA letter to documents
  documentsUpload() {
    let loggedInUser = this.authService.getToken();
    const payLoad = {
      entityType: 'client',
      entityId: parseInt(this.clientId),
      documentName: 'NDA Letter',
      type: 'Unsigned',
      documentType: 'NDA Letter',
      documentUrl: this.result.documentUrl,
      status: 'active',
      date: this.clientForm.get('effectiveDate')?.value,
      createdBy: loggedInUser.employeeId,
      updatedBy: loggedInUser.employeeId,
    };
    this.subscription = this.http.postdata('Documents', payLoad).subscribe({
      next: (data: any) => {
        if (data) {
          console.log("data", data)
          this.postNDAmanagementletter(data.data.documentId);
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(reason.error.message);
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  //function to post the NDA details to NDA management
  postNDAmanagementletter(unsignedDocRefId: any) {
    let loggedInUser = this.authService?.getToken();
    const formData = this.clientForm?.value;
    const attributesdata = [
      // { key: 'effectiveDate', value: formData?.effectiveDate?.toString() ?? null, dataType: 'string',},
      { key: 'companyName', value: this.clientForm.get('companyName')?.value?.toString() ?? this.clientDtails.data.clientName, dataType: 'string',},
      { key: 'companyAddress', value:this.clientForm.get('companyAddress')?.value?.toString() ?? this.clientDtails.data.address, dataType: 'string',},
      { key: 'serviceProviderName', value: formData?.serviceProviderName?.toString() ?? null, dataType: 'string',},
      { key: 'serviceProviderAddress', value: formData?.serviceProviderAddress?.toString() ?? null, dataType: 'string',},
      { key: 'termDuration', value: formData?.termduration?.toString() ?? null, dataType: 'string',},
      { key: 'governingLaw', value: formData?.governingLaw?.toString() ?? null, dataType: 'string',},
      { key: 'termFrequency', value: formData?.termfrequency?.value?.toString() ?? null, dataType: 'string',},
      { key: 'postTermConfidentialityDuration', value: formData?.posttermconfidentialityduration?.toString() ?? null, dataType: 'string',},
      { key: 'postTermConfidentialityFrequency', value: formData?.posttermconfidentialityfrequency?.value?.toString() ?? null, dataType: 'string',},
    ];
    const payLoad = {
      letterType: 'NDA Letter',   // since you already capture Document Type
      effectiveDate: this.clientForm.get('effectiveDate')?.value,
      clientId: parseInt(this.clientId),
      // authorityId: this.clientForm.get('signatureAuthority')?.value,
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
          this.conformationPopup.openSuccessModal('NDA letter generated successfully')
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