import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { IAddress } from '../../../Interfaces/letters-model';
import { IAssertsType } from '../../../Interfaces/job-model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../services/form-validations.service';
import { LettersheaderComponent } from "../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { LetterFooterComponent } from "../../../shared/letters-shared-content/letter-footer/letter-footer.component";

@Component({
  selector: 'app-trainee-appointment-letter-acknowledgement',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LettersheaderComponent, DateformatPipe, LetterFooterComponent],
  templateUrl: './trainee-appointment-letter-acknowledgement.component.html',
  styleUrl: './trainee-appointment-letter-acknowledgement.component.scss'
})
export class TraineeAppointmentLetterAcknowledgementComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  rejectForm!: FormGroup;
  @Input() letterdata: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private confirmation: OpenModalService,
    public formsValidation: FormValidationsService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  empdata = {} as any;
  employeeName: any;
  traineeAppointmentletterData = {} as any;
  currentDate = moment()
  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeName = `${this.empdata.firstName ?? ''} ${this.empdata.middleName ?? ''
      } ${this.empdata.lastName ?? ''}`;
    this.traineeAppointmentletterData = this.empdata;
    this.Onclick(this.empdata.employeeId);
  }

  Onclick(employeeId: any) {
    console.log(employeeId);
    this.traineeAppointmentletterData = {};
    this.traineeAppointmentletterData = this.empdata;
    this.traineeAppointmentletterData.dateOfJoining = this.formatDatewithDate(
      this.traineeAppointmentletterData.dateOfJoining
    );
    if (this.letterdata) {
      this.traineeAppointmentletterData.notes = this.letterdata.note;
      this.traineeAppointmentletterData.addressType =
        this.letterdata.addressType;
      this.traineeAppointmentletterData.appointmentdate =
        this.letterdata.issuedDate;
      this.traineeAppointmentletterData.Copys = this.letterdata.docType;
    }
    console.log(this.traineeAppointmentletterData);
    this.getJobdetails(this.traineeAppointmentletterData);
    this.getEmployeeAddress(this.traineeAppointmentletterData.employeeId);
    this.getAuthorityDetails();
    this.getAssestTypeByEmployeeId();
  }

  formatDatewithDate(date: Date): string | void {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
  }

  //get Job Details by empployeeid
  employeeJobDetails = {} as any;
  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          //  console.log(data);
          const today = new Date();
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
  employeeaddress = [] as any;
  address = {} as IAddress;
  getEmployeeAddress(Value: any) {
    const EmployeeId = Value;
    this.subscription = this.http
      .getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeaddress = data;
          if (this.employeeaddress?.employeeAddresses?.length > 0) {
            this.address = this.employeeaddress.employeeAddresses.find(
              (address: IAddress) =>
                address.type.toLowerCase() ==
                this.traineeAppointmentletterData.addressType
            );
            this.traineeAppointmentletterData.addressLine1 =
              this.address.addressLine1;
            this.traineeAppointmentletterData.addressLine2 =
              this.address.addressLine2;
            this.traineeAppointmentletterData.city = this.address.city;
            this.traineeAppointmentletterData.state = this.address.state;
            this.traineeAppointmentletterData.country = this.address.country;
            this.traineeAppointmentletterData.zipCode = this.address.zipCode;
          }
        },
      });
  }

  //get offer letter Authority list
  authorityDetails = [] as any;
  authorityDesignation: any;
  getAuthorityDetails() {
    const offertype = 'Trainee Appointment Letter';
    this.subscription = this.http
      .getData(`SignaturesList?LetterType=${offertype}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.authorityDetails = data;
          if (this.letterdata.authoritySignature) {
            if (this.authorityDetails?.length > 0) {
              const signatureAuthorityDetails = this.authorityDetails.find(
                (c: any) => c.employeeId == this.letterdata.authoritySignature
              );
              console.log(signatureAuthorityDetails);
              this.authorityDesignation = signatureAuthorityDetails.designation;
              this.traineeAppointmentletterData.authorityName = `${signatureAuthorityDetails.firstName ?? ''
                } ${signatureAuthorityDetails.middleName ?? ''} ${signatureAuthorityDetails.lastName ?? ''
                }`;
            }
          }
        },
      });
  }

  //function to get assest type by employeeid
  assesttypegetdetails = [] as IAssertsType[];
  getAssestTypeByEmployeeId() {
    const EmployeeId = parseInt(this.empdata.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http
      .getData(`AssetTable/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.assesttypegetdetails = data as IAssertsType[];
          const res = data.find((emp: any) => emp.id == this.letterdata.assetId)
          this.traineeAppointmentletterData.asserttype = res.assetType;
          this.traineeAppointmentletterData.model = res.model;
          this.traineeAppointmentletterData.serial = res.serialNumber;
        },
      });
  }

  openpopup(content: any) {
    this.modalService.open(content, { centered: true });
  }

  isLoading = false;
  AppointmentFile!: File;
  generateDocument() {
    this.isLoading = true;
    const empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.traineeAppointmentletterData = {
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
      console.log('Document generated:', this.traineeAppointmentletterData);
    }, 2000);
  }

  //function to generate the appointment letter
  async onAppointmentLetterSubmit() {
    this.isLoading = true;
    const data = this.traineeAppointmentletterData;
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

    const fileName = `${data.firstName}${data.middleName ? `_${data.middleName}` : ''}${data.lastName ? `_${data.lastName}` : ''}_${new Date().getTime()}_TraineeAppointmentLetter_Signed.pdf`;
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
    const filePath = `/FusionDocuments/Employee Documents/Trainee Appointment Letter/${this.traineeAppointmentletterData.employeeId}`;
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
      createdBy: this.empdata.employeeId,
    };
    this.subscription = this.http
      .putData('LetterAcknowledgementDetails/updateAcknowledgement', payload)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.isacknowledged = true;
          this.isLoading = false;
          this.confirmation.openSuccessModal('Trainee Appointment Letter Acknowledged Successfully');
           setTimeout(() => {
            this.modalService.dismissAll();
            this.http.triggerRefresh();
          }, 2000)
        },
        error: (error: any) => {
          console.error('Error:', error);
          this.confirmation.openErrorModal(error.error.error);
          this.isacknowledged = false;
          this.isLoading = false;
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

  // function to post the acknowledgement if the employee rejects the Trainee Appointment letter
  isLoadingreject = false;
  postacknowledgementForReject(form: FormGroup) {
    this.isLoadingreject = true;
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.empdata.employeeId,
      // signedDocUrl: filePath,
      status: 'Rejected',
      rejectedComments: form.value.notes
    };
    this.subscription = this.http
      .putData('LetterAcknowledgementDetails/updateAcknowledgement', payload)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.isacknowledged = true;
          this.isLoading = false;
          this.isLoadingreject = false;
          this.confirmation.openSuccessModal('Trainee Appointment Letter Rejected Successfully');
           setTimeout(() => {
            this.modalService.dismissAll();
            this.http.triggerRefresh();
          }, 2000)
        },
        error: (error: any) => {
          console.error('Error:', error);
          this.confirmation.openErrorModal(error.error.error);
          this.isacknowledged = false;
          this.isLoadingreject = false;
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
