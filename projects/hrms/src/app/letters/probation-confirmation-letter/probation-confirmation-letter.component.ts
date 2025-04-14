import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../shared/letter-footer/letter-footer.component";
import { OpenModalService } from '../../services/open-modal.service';
@Component({
  selector: 'app-probation-confirmation-letter',
  imports: [CommonModule, SelectModule, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './probation-confirmation-letter.component.html',
  styleUrl: './probation-confirmation-letter.component.scss'
})

export class ProbationConfirmationLetterComponent {
  subscription!: Subscription;
  employeeiddetails = [] as any;
  probationemp = [] as any;
  probationLetterData = {} as any;
  authorityDetails = [] as any;
  Employeeinfo = {} as any;
  probationFile!: File;
  disableFieldsForApproval: boolean = true;
  loading: boolean = false;
  Status: any;
  probationConfirmationForm!: FormGroup;
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  todayDate!: string;
  isdateofprobation: boolean = true;

  constructor(private http: HttpService, private router: Router, private fb: FormBuilder, private openModalService:OpenModalService) { }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    this.initializeForm();
    this.getProbationEmployees();
    this.getAuthorityDetails();
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  DateValidation() {
    if (this.probationLetterData.dateofprobation <= this.probationLetterData.probationEndDate) {
      this.isdateofprobation = false;
    } else {
      this.isdateofprobation = true;
    }
  }

  naviagte(){
    this.router.navigate(['/admin/probation-employees']);
  }

  initializeForm() {
    this.probationConfirmationForm = this.fb.group({
      employeeId: [null, Validators.required],
      issuedDate: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      Documenttype: [null, Validators.required],
      authorityid: [null, Validators.required],
    });
  }

  //get employee ids for dropdown
  getProbationEmployees() {
    this.subscription = this.http.getData(`ProbationFlow/getAllProbationEmployees?substatus=${"Probation Confirmed"}`).subscribe({
      next: (data: any) => {
        this.probationemp = data.map((employee: any) => ({
          ...employee,
          fullName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`
        }));
        this.pathValuesFuction();
      },
      error: (reason: any) => {
        console.log(reason);
      },
    })
  }

  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Probation Confirmation Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authoruty: any) => ({
          ...authoruty,
          fullName: `${authoruty.firstName} ${authoruty.middleName ? authoruty.middleName + ' ' : ''}${authoruty.lastName}`
        }));
      }
    })
  }

  //to fromat Date
  private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  async postProbationLetterFormSubmit() {
    this.loading = true;
    const data = await this.probationLetterData;
    data.dateofaddress = this.formatDate(data.dateofaddress);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);
    console.log(data);
    const pdfContent = document.getElementById('pdfContent1');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        console.log(imgWidth);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        console.log(imgHeight)
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        const fileName = `${data.firstName}_${data.middleName ?? ""}_${data.lastName ?? ""}_${new Date().getTime()}_ProbationConfirmationLetter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
        console.log(blob);
        //creating form file to upload into AZure
        let d: Date = new Date()
        this.probationFile = new File( [blob], fileName, { type: 'application/pdf', });
        this.uploadProbationLetter();
      });
    }
  }

  uploadProbationLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.probationLetterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.probationFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.postProbationDetails(data.path);
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.openModalService.openErrorModal('file upload  is failed');
      },
    });
  }

  //function to get the probation request details
  getProbationDetails = {} as any;
  getProbationRequest(EmployeeId: number) {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.getProbationDetails = response.find((ele: any) => {
          return (ele.status === 'Processed');
        });
      }
    })
  }

  Documenturlresult: any;
  postProbationDetails(docurl: string) {
    this.getProbationDetails.documentURL = docurl;
    this.subscription = this.http.postdata('ProbationFlow/updateProbationActivationEmployees', this.getProbationDetails).subscribe({
      next: (data: any) => {
        this.Documenturlresult = data.documentURL;
        this.disableFieldsForApproval = false;
        this.loading = false;
        this.openModalService.openSuccessModal("Probation Extension Letter Generated Successfully");
        this.probationConfirmationemail();
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //function to patch the values in the form to the template
  pathValuesFuction() {
    const formValues = this.probationConfirmationForm.value;
    this.probationLetterData.firstName = formValues.employeeId?.firstName,
    this.probationLetterData.middleName = formValues.employeeId?.middleName,
    this.probationLetterData.lastName = formValues.employeeId?.lastName,
    this.probationLetterData.fusionEmpId = formValues.employeeId?.fusionEmpId,
    this.probationLetterData.jobRole = formValues.employeeId?.jobDetails?.jobRole,
    this.probationLetterData.department = formValues.employeeId?.firstName,
    this.probationLetterData.workLocation = formValues.employeeId?.jobDetails?.subLocation+ ', '+formValues.employeeId?.jobDetails?.lopcation,
    this.probationLetterData.issuedDate = formValues.issuedDate,
    this.probationLetterData.effectiveDate = formValues.effectiveDate,
    this.probationLetterData.Copys = formValues.Documenttype;
    this.probationLetterData.authorityName = formValues.authorityid?.fullName,
    this.probationLetterData.authorityDesignation = formValues.authorityid?.designation,
    this.probationLetterData.employeeId = formValues.employeeId?.employeeId

    
  }

  //to post probation letter email Details to the offerletter table
  probationConfirmationemail() {
    let pdata = {
      "employeeId": this.probationLetterData.employeeId,
      "documentUrl": this.Documenturlresult
    }
    this.subscription = this.http.postdata(`CustomEmail/ConfirmationofProbationPeriod`, pdata).subscribe({
      next: (data: any) => {
        console.log(data);
        this.openModalService.openSuccessModal("Probation Confirmation Letter Sent Successfully");
        this.router.navigate(['/admin/probation-employees']);
        this.probationConfirmationForm.reset();
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}