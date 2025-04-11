import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IAddress, IaddressemployeeDetails, IProbationEmployees } from '../../Interfaces/letters-model';
import { Subscription } from 'rxjs';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../shared/letter-footer/letter-footer.component";
@Component({
  selector: 'app-probation-confirmation-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './probation-confirmation-letter.component.html',
  styleUrl: './probation-confirmation-letter.component.scss'
})

export class ProbationConfirmationLetterComponent {
  subscription!: Subscription;
  employeeiddetails = [] as any;
  probationemp = [] as any;
  employeeJobDetails = {} as any;
  probationLetterData = {} as any;
  authorityName: any;
  authorityDetails = [] as any;
  employeeaddress = [] as any;
  Employeeinfo = {} as any;
  employeedata = {} as any;
  probationFile!: File;
  isdateofprobation: boolean = true;
  disableFieldsForApproval: boolean = true;
  loading: boolean = false;
  todayDate!: string;
  Status: any;
  employeeForm!: FormGroup;

  constructor(private http: HttpService, private router: Router, private fb: FormBuilder) {
  }

  DateValidation() {
    if (this.probationLetterData.dateofprobation <= this.probationLetterData.probationEndDate) {
      this.isdateofprobation = false;
    } else {
      this.isdateofprobation = true;
    }
  }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.getProbationEmployees();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: [null, Validators.required],
      issuedDate: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      Documenttype: [null, Validators.required],
      authorityid: [null, Validators.required],
    });
  }

  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.lastName
  }

  //get employee ids for dropdown
  getProbationEmployees() {
    this.subscription = this.http.getData(`ProbationFlow/getAllProbationEmployees?substatus=${"Probation Confirmed"}`).subscribe({
      next: (data: any) => {
        this.probationemp = data as IProbationEmployees[];
        console.log(this.probationemp);
      },
      error: (reason: any) => {
        console.log(reason);
      },
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

  //function to get the address 
  getEmployeeAddress(Value: any) {
    let EmployeeId = Value.employeeId
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeaddress = data as IAddress[];
      }
    })
  }

  //function to select the current address 
  address = {} as IAddress;
  onclickSelectAddress(Value: any) {
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == Value)
    }
    this.probationLetterData.addressLine1 = this.address.addressLine1
    this.probationLetterData.addressLine2 = this.address.addressLine2
    this.probationLetterData.city = this.address.city
    this.probationLetterData.state = this.address.state
    this.probationLetterData.country = this.address.country
    this.probationLetterData.zipCode = this.address.zipCode
  }

  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Probation Confirmation Letter'
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.authorityDetails = data
      }
    })
  }

  //get employee ids for dropdown
  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data as IaddressemployeeDetails[];
          console.log(this.employeeiddetails);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //get jobdetails
  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          let res = data[0];
          this.employeeJobDetails = res;
          Employee.jobRole = res.jobRole;
          Employee.workLocation = `${res.locationName}, ${res.sublocationName}`;
          Employee.department = res.department
          console.log(Employee.jobRole);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  async postProbationLetterFormSubmit() {
    this.loading = true;
    const data = await this.probationLetterData;
    data.dateofaddress = this.formatDate(data.dateofaddress);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);
    console.log(data);
    const pdfContent = document.getElementById('pdfContent');
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
        this.probationFile = new File(
          [blob],
          fileName,
          {
            type: 'application/pdf',
          }
        );
        this.uploadProbationLetter();
      });
    }
  }

  uploadProbationLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.probationLetterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.probationFile)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.postProbationDetails(data.path)
          }
        },
        error: (reason: any) => {
          console.log(reason);
          // this.dataFailureMsg('file upload  is failed');
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
          return (ele.status?.toLowerCase() === 'processed');
        });
      }
    })
  }

  Documenturlresult: any;
  postProbationDetails(docurl: string) {
    this.getProbationDetails.documentURL = docurl;
    this.subscription = this.http.postdata('ProbationFlow/updateProbationActivationEmployees', this.getProbationDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.Documenturlresult = data.documentURL;
          this.disableFieldsForApproval = false;
          this.loading = false;
          // this.dataSuccessMsg("Probation Extension Letter Generated Successfully")
        },
        error: (reason: any) => {
          console.log(reason);
        },
    });
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
        // this.dataSuccessMsg("Probation Confirmation Letter Sent Successfully")
        this.router.navigate(['/admin/probationemployees']);
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
