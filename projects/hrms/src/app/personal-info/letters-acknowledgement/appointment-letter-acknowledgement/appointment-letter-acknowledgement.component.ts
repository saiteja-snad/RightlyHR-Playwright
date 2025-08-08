import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../services/form-validations.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IAddress } from '../../../Interfaces/letters-model';
import { IAssertsType } from '../../../Interfaces/job-model';
import { OpenModalService } from '../../../services/open-modal.service';
import { LettersheaderComponent } from "../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../../shared/letters-shared-content/letter-footer/letter-footer.component";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { IEmployeeIdentity } from '../../../letters/appointment-letter/appointment-letter-model';

@Component({
  selector: 'app-appointment-letter-acknowledgement',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LettersheaderComponent, LetterFooterComponent, DateformatPipe, ConfirmationIconComponent],
  templateUrl: './appointment-letter-acknowledgement.component.html',
  styleUrl: './appointment-letter-acknowledgement.component.scss'
})
export class AppointmentLetterAcknowledgementComponent implements OnInit, OnDestroy {
  rejectForm!: FormGroup;
  isLoading = false;
  removeLater = false;
  appointmentletter = {} as any;
  employeeJobDetails = {} as any;
  isLoadingreject = false;
  @Input() letterdata: any;
  currentDate: any;

  subscription!: Subscription;
 panDetails: IEmployeeIdentity[] = [];
  constructor(
    private fb: FormBuilder,
    public formsValidation: FormValidationsService,
    private modalService: NgbModal,
    private http: HttpService,
    private confirmation: OpenModalService
  ) { }

  employeeName: any;
  empdata = {} as any;
  ngOnInit(): void {
    console.log(this.letterdata)
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeName = `${this.empdata.firstName ?? ''} ${this.empdata.middleName ?? ''
      } ${this.empdata.lastName ?? ''}`;
    this.appointmentletter = this.empdata;
    this.Onclick(this.empdata.employeeId);
    this.initializeRejectForm();
    this.currentDate = new Date();
  }

  Onclick(employeeId: any) {
    console.log(employeeId);
    this.appointmentletter = {};
    this.appointmentletter = this.empdata;
    this.appointmentletter.dateOfJoining = this.formatDatewithDate(
      this.appointmentletter.dateOfJoining
    );
    if (this.letterdata) {
      this.appointmentletter.notes = this.letterdata.note;
      this.appointmentletter.addressType = this.letterdata.addressType;
      this.appointmentletter.appointmentdate = this.letterdata.issuedDate;
      this.appointmentletter.docType = this.letterdata.docType;
    }
    console.log(this.appointmentletter);
    this.getJobdetails(this.appointmentletter);
    this.getEmployeeAddress(this.appointmentletter.employeeId);
    this.getIdentityByEmpid(this.appointmentletter.employeeId);
    this.getAuthorityDetails();
  }
  getIdentityByEmpid(employeeId: number) {
    this.subscription = this.http.getData(`IdentityTable/${employeeId}`).subscribe({
      next: (data: any) => {
        this.panDetails = data.filter((item: { identityType: string; }) => item.identityType === 'PAN');
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  formatDatewithDate(date: Date): string | void {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
  }

  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          const jobdata = data.find((emp: any) => emp.id = this.letterdata.jobId);
          const res = jobdata;
          this.employeeJobDetails = res;
          Employee.jobRole = res.jobRole;
          Employee.locationName = res.locationName;
          Employee.subLocation = res.subLocation;
          Employee.department = res.departmentName;
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //function to get the address
  address = {} as IAddress;
  employeeaddress = [] as any;
  getEmployeeAddress(Value: any) {
    const EmployeeId = Value;
    this.subscription = this.http
      .getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeaddress = data as IAddress[];
          if (this.employeeaddress?.employeeAddresses?.length > 0) {
            this.address = this.employeeaddress.employeeAddresses.find(
              (address: IAddress) =>
                address.type.toLowerCase() ==
                this.appointmentletter.addressType.toLowerCase()
            );
            this.appointmentletter.addressLine1 = this.address.addressLine1;
            this.appointmentletter.addressLine2 = this.address.addressLine2;
            this.appointmentletter.city = this.address.city;
            this.appointmentletter.state = this.address.state;
            this.appointmentletter.country = this.address.country;
            this.appointmentletter.zipCode = this.address.zipCode;
          }

        },
      });
  }

  //get offer letter Authority list 
  authorityDetails = [] as any;
  authorityDesignation: any;
  getAuthorityDetails() {
    const offertype = 'Appointment Letter'
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.authorityDetails = data;
        if (this.letterdata.authoritySignature) {
          if (this.authorityDetails?.length > 0) {
            const signatureAuthorityDetails = this.authorityDetails.find(
              (c: any) => (c.employeeId == this.letterdata.authoritySignature)
            );
            console.log(signatureAuthorityDetails)
            this.authorityDesignation = signatureAuthorityDetails.designation;
            this.appointmentletter.authorityName = `${signatureAuthorityDetails.firstName ?? ''} ${signatureAuthorityDetails.middleName ?? ''} ${signatureAuthorityDetails.lastName ?? ''}`;
          }
        }
      }
    })
  }

  openpopup(content: any) {
    this.modalService.open(content, { centered: true });
  }

  // Function to generate the document
  generateDocument() {
    this.isLoading = true;
    const empdata = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.appointmentletter = {
      employeeName: empdata.name,
      employeeId: empdata.employeeId,
      designation: empdata.designation,
      department: empdata.department,
      joiningDate: empdata.joiningDate,
      authorityName: empdata.authorityName,
      authorityDesignation: this.authorityDesignation,
    };

    // Simulate document generation delay
    setTimeout(() => {
      this.isLoading = false;
      console.log('Document generated:', this.appointmentletter);
    }, 2000);
  }

  //function to generate the appointment letter
  AppointmentFile!: File;
  async onAppointmentLetterSubmit() {
    this.isLoading = true;
    const data = this.appointmentletter;
    //data.dateOfJoining = this.formatDate(data.dateOfJoining);
    //data.appointmentdate = this.formatDate(data.appointmentdate);

    console.log(data);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();

    const pdfContents = [
      'pdfContent1',
      'pdfContent2',
      'pdfContent3',
      'pdfContent4',
      'pdfContent5',
      'pdfContent6',
      'pdfContent7',
      'pdfContent8',
      'pdfContent9',
      'pdfContent10',
      'pdfContent11',
      'pdfContent12',
      'pdfContent13'
    ]; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    this.isLoading = true;

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
      pdf.addImage(
        imageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        imageData.imgHeight,
        '',
        'FAST'
      );
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }

    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(
        lastImageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        lastImageData.imgHeight,
        '',
        'FAST'
      );
    }

    const fileName = `${data.firstName}${data.middleName ? `_${data.middleName}` : ''}${data.lastName ? `_${data.lastName}` : ''}_${new Date().getTime()}_AppointmentLetter_Signed.pdf`;
    // pdf.save(fileName);

    const blob = pdf.output('blob');
    console.log(blob);
    //creating form file to upload into AZure
    this.AppointmentFile = new File([blob], fileName, {
      type: 'application/pdf',
    });
    this.uploadAppointLetter();
  }

  // Function to upload the Appointment Letter
  uploadAppointLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Appointment Letter/${this.appointmentletter.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.AppointmentFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.postacknowledgement(data.path);
            console.log(data);
          }
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  // Function to post the Acknowledgement if the employee acknowledge the Appointment Letter
  isacknowledged = true;
  postacknowledgement(filePath: string) {
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.empdata.employeeId,
      signedDocUrl: filePath,
      status: 'Acknowledged',
      generatedBy: this.letterdata.generatedBy,
      IssuedDate: this.letterdata.generatedDate
    };
    this.subscription = this.http
      .putData('LetterAcknowledgementDetails/updateAcknowledgement', payload)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.isacknowledged = true;
          this.isLoading = false;
          this.confirmation.openSuccessModal('Appointment Letter Accepted Successfully');
          setTimeout(() => {
            this.modalService.dismissAll();
            this.http.triggerRefresh();
          }, 2000)
        },
        error: (error: any) => {
          console.error('Error:', error);
          this.isacknowledged = false;
          this.isLoading = false;
          this.confirmation.openErrorModal(error.error.error);
        },
      });
  }

  initializeRejectForm() {
    this.rejectForm = this.fb.group({
      notes: ['', Validators.required]
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  rejectpopup() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }

  // Function to post the Acknowledgement if the employee rejects the Appointment Letter
  handleReject(form: FormGroup) {
    if (form.invalid) {
      form.markAllAsTouched();
    }
    this.isLoadingreject = true;
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.empdata.employeeId,
      status: 'Rejected',
      rejectedComments: form.value.notes,
      generatedBy: this.letterdata.generatedBy,
      IssuedDate: this.letterdata.generatedDate
    };

    this.subscription = this.http.putData('LetterAcknowledgementDetails/updateAcknowledgement', payload).subscribe({
      next: (res: any) => {
        this.isacknowledged = true;
        this.isLoading = false;
        this.isLoadingreject = false;
        this.confirmation.openSuccessModal('Appointment Letter Rejected Successfully');
        setTimeout(() => {
          this.modalService.dismissAll();
          this.http.triggerRefresh();
        }, 2000)
      },
      error: (err: any) => {
        this.isacknowledged = false;
        this.isLoading = false;
        this.isLoadingreject = false;
        this.confirmation.openErrorModal(err.error.error);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
