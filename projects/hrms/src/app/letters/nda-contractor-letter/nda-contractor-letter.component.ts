
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../letters-builder-files/custom-fonts-vfs';
import { buildNdaLetterDoc } from '../../letters-builder-files/nda-contractor-letter.builder';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { IDepartment, IemployeeDetails, IIssuelocation, } from '../../Interfaces/letters-model';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { OpenModalService } from '../../services/open-modal.service';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IAssertsType } from '../../Interfaces/job-model';
import { IEmployeeIdentity, IAsset, IEmployeeJobInfo, IEmployeeProfile, IEmployeeAddress } from '../appointment-letter/appointment-letter-model';
import { IEmployeeSignatures } from '../letters.modal';
import { SignalsService } from '../../services/signals.service';
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { fetchLetterAssets, setupLetterPdfMake } from '../../letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-nda-contractor-letter',
  imports: [CommonModule, TranslateModule, Select, NgxCountriesDropdownModule, ReactiveFormsModule, NgbPopoverModule, DateformatPipe, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './nda-contractor-letter.component.html',
  styleUrl: './nda-contractor-letter.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class NdaContractorLetterComponent {
  subscription!: Subscription;
  appointmentLetterTemplate: any | string | ArrayBuffer | null = null;
  JoinDateValid: boolean = true;
  currentDate: Date = new Date();
  AppointmentFile!: File;
  employeeForm!: FormGroup;
  spinnerLoader = false;
  spinnerLoader1 = false;
  releaseLetterButton = true;
  employeeiddetails: IemployeeDetails[] = [];
  departmentDetails: IDepartment[] = [];
  branchLocations: IIssuelocation[] = [];
  authorityDetails: IEmployeeSignatures[] = [];
  panDetails: IEmployeeIdentity[] = [];
  assestDetails: IAsset[] = [];
  employeeJobDetails: IEmployeeJobInfo | undefined;
  employeeaddress!: IEmployeeProfile;
  selectedEmployee!: IemployeeDetails;
  employeeFullname!: string;
  errorMsg!: string;
  todayDate!: string;
  selectedAuthority: IEmployeeSignatures | undefined;
  authorityFullName!: string;
  isLoading = false;
  SelectDropDown = [
    { name: 'Current Address', code: 'C' },
    { name: 'Permanent Address', code: 'P' }
  ];
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];

  constructor(private http: HttpService, private router: Router, private authService: AuthService,
    private conformationPopup: OpenModalService, private fb: FormBuilder, private signalService: SignalsService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllActiveEmployees();
    this.getAllDepartments();
    this.getAllBranchLocations();
    this.getAssertType();
    this.getAuthorityDetails();
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      employeeId: ['', Validators.required],
      ndassentdate: ['', Validators.required],
      SelectDropDown: ['', Validators.required],
      dateOfJoining: [{ value: '', disabled: true }, Validators.required],
      documentType: ['', Validators.required],
      notes: ['',],
      authorityid: ['', Validators.required],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      pinCode: ['']
    });
    //   this.employeeForm.get('ndassentdate')?.valueChanges.subscribe(() => {
    //   this.JoiningDateValidation();
    // });
    //   this.employeeForm.get('dateOfJoining')?.valueChanges.subscribe(() => {
    //     this.JoiningDateValidation();
    //   });
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/getOfferLetterAcceptedContractEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data as IemployeeDetails[];
        this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
          ...emp,
          fullName: `${emp.employeeId ?? ''} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`,
          // Concatenate firstName, middleName, lastName
        }));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllDepartments() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllBranchLocations() {
    this.subscription = this.http.getData(`BranchLocation`).subscribe({
      next: (data: any) => {
        this.branchLocations = data as IIssuelocation[];
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  getAuthorityDetails() {
    let offertype = 'NDA Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim()
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  getAssertType() {
    this.subscription = this.http.getData(`AssetType`).subscribe({
      next: (data: any) => {
        this.assestDetails = data;
      }
    })
  }

  onClickEmployee(event: any) {
    this.selectedEmployee = event.value;
    this.employeeFullname = this.selectedEmployee.firstName + ' ' + (this.selectedEmployee.middleName ?
      this.selectedEmployee.middleName + ' ' : '') + this.selectedEmployee.lastName;
    this.getContractorDetails(this.selectedEmployee.employeeId);
    this.getJobdetails(this.selectedEmployee.employeeId);
    this.getEmployeeAddress(this.selectedEmployee.employeeId);
    this.getIdentityByEmpid(this.selectedEmployee.employeeId);
    this.getOfferLetterDetails(this.selectedEmployee.employeeId);
    this.getAssestTypeByEmployeeId(this.selectedEmployee.employeeId);
  }

  getContractorDetails(employeeId: number) {
    this.subscription = this.http.getData(`ContractDetails/getbyemployeeId/${employeeId}`).subscribe({
      next: (res: any) => {
        if (res?.data?.length > 0) {
          const latestRecord = res.data.reduce((latest: { id: number; }, current: { id: number; }) => {
            return current.id > latest.id ? current : latest;
          });
          const doj = this.formatDatewithDate(latestRecord.contractStartDate);
          this.employeeForm.patchValue({
            dateOfJoining: doj
          });
        } else {
          console.log('No contractor details found.');
        }
      },
      error: (err) => {
        const doj = this.formatDatewithDate(this.employeeaddress.dateOfJoining);
        this.employeeForm.patchValue({
          dateOfJoining: doj
        });
        console.error('Error fetching contractor details:', err);
      }
    });
  }

  assesttypegetdetails = [] as IAssertsType[];
  ndaletter = {} as any;
  //function to get assest type by employeeid
  getAssestTypeByEmployeeId(EmployeeId: number) {
    this.subscription = this.http.getData(`AssetTable/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.assesttypegetdetails = data as IAssertsType[];
        if (this.assesttypegetdetails?.length > 0) {
          this.ndaletter.asserttype = data[0].assetType;
          this.ndaletter.model = data[0].model;
          this.ndaletter.serial = data[0].serialNumber;
        }
      },
    });
  }

  getJobdetails(employeeId: number) {
    this.subscription = this.http.getData(`JobDetails/Empname/${employeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.errorMsg = 'No job details found for this employee.';
          this.employeeForm.get('jobValid')?.setValue(false);
        } else {
          let res = data.sort((a: any, b: any) => b.effectiveDate - a.effectiveDate)[0];
          this.employeeJobDetails = res;
          this.errorMsg = '';
          this.employeeForm.get('jobValid')?.setValue(true);
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getEmployeeAddress(employeeId: number) {
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IEmployeeProfile;
        this.ndaletter = data;
      }
    })
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

  offerDetails!: any;
  getOfferLetterDetails(employeeId: number) {
    this.subscription = this.http.getData(`OfferLetter/getbyEmpidNames/${employeeId}`).subscribe({
      next: (data: any) => {
        this.offerDetails = data;
        const today = moment();
        this.todayDate = today.toISOString().split('T')[0];
      }
    })
  }

  designationName: any;
  onclickDesignation(event: any) {
    this.selectedAuthority = event.value;
    if (this.selectedAuthority) {
      this.authorityFullName = this.selectedAuthority.middleName
        ? `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName} ${this.selectedAuthority.lastName}`
        : `${this.selectedAuthority.firstName} ${this.selectedAuthority.lastName}`;
      this.designationName = this.selectedAuthority.designation
    }
  }

  private formatDatewithDate(date: Date): string | void {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
  }

  onclickSelectAddress(Value: any) {
    const selectedAddress = this.employeeaddress.employeeAddresses.find(
      (address: IEmployeeAddress) => address.type.toLowerCase() === Value.value.toLowerCase()
    );
    if (selectedAddress) {
      this.employeeForm.patchValue({
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country,
        pinCode: selectedAddress.zipCode
      });
      this.ndaletter.addressLine1 = selectedAddress.addressLine1;
      this.ndaletter.addressLine2 = selectedAddress.addressLine2;
      this.ndaletter.city = selectedAddress.city;
      this.ndaletter.state = selectedAddress.state;
      this.ndaletter.country = selectedAddress.country;
      this.ndaletter.zipCode = selectedAddress.zipCode;
    }
  }

  JoiningDateValidation() {
    const appointmentDate = this.employeeForm.get('ndassentdate')?.value;
    const dateOfJoining = this.employeeForm.get('dateOfJoining')?.value;
    if (appointmentDate && dateOfJoining) {
      const appDate = new Date(appointmentDate);
      const joinDate = new Date(dateOfJoining);
      this.JoinDateValid = joinDate > appDate;
    } else {
      this.JoinDateValid = true;
    }
    // Optional: trigger Angular validation refresh
    this.employeeForm.get('dateOfJoining')?.updateValueAndValidity({ onlySelf: true });
  }

  async onAppointmentLetterSubmit(f: FormGroup) {
    this.spinnerLoader = true;
    if (!this.selectedEmployee?.firstName || !this.selectedEmployee?.lastName) {
      console.error('Employee first name or last name is missing');
      this.spinnerLoader = false;
      return;
    }
    const fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.middleName ?? ''}_${this.selectedEmployee.lastName}_${new Date().getTime()}_Non-DisclosureAgreementLetter_Unsigned.pdf`;
    const isSoftCopy = f.value.documentType === true;

       const [assets, pm] = await Promise.all([
         fetchLetterAssets(isSoftCopy),
         setupLetterPdfMake(),
       ]);

    const docDef = buildNdaLetterDoc({
      firstName: this.selectedEmployee.firstName,
      middleName: this.selectedEmployee.middleName,
      lastName: this.selectedEmployee.lastName,
      panNumber: this.panDetails?.[0]?.identityNumber,
      addressLine1: f.value.addressLine1,
      addressLine2: f.value.addressLine2,
      city: f.value.city,
      state: f.value.state,
      country: f.value.country,
      pinCode: f.value.pinCode,
      ndaSentDate: f.value.ndassentdate,
      authorityFullName: this.authorityFullName,
      authorityDesignation: this.selectedAuthority?.designation,
      backgroundImageBase64: assets.backgroundImageBase64,
      headerLogoBase64: assets.headerLogoBase64,
      useVerdanaFont: true,
      useAutographyFont: true,
    });

    try {
      const blob: Blob = await pm.createPdf(docDef).getBlob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
      this.AppointmentFile = new File([blob], fileName, { type: 'application/pdf' });
      this.spinnerLoader = false;
      this.releaseLetterButton = false;
      this.conformationPopup.openSuccessModal('Non-Disclosure Agreement Letter generated successfully');
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
    }
  }

  private fetchImageAsBase64(url: string): Promise<string> {
    return fetch(url).then(res => res.blob()).then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
  }

  private async getFileBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch {
      return null;
    }
  }

  //Post NDA Details
  postNDADetails(docUrl: string) {
    this.spinnerLoader1 = true;
    let loggedInUser = this.authService.getToken();
    let postAppDetails = {
      employeeId: this.selectedEmployee.employeeId,
      ndaSentDate: this.employeeForm.get('ndassentdate')?.value,
      ndaSentStatus: 'Document Sent',
      ndaSentBy: loggedInUser.employeeId,
      documentUrl: docUrl,
      status: 'Generated',
      addressType: this.employeeForm.get('SelectDropDown')?.value,
      note: this.employeeForm.get('notes')?.value,
      authoritySignature: this.selectedAuthority?.employeeId,
      docType: this.employeeForm.get('documentType')?.value,
      issuedDate: moment(this.employeeForm.get('ndassentdate')?.value).format('YYYY-MM-DD'),
      jobId: this.employeeJobDetails?.id,
      isDeleted: false
    };
    this.subscription = this.http.postdata('NdaLetter/generateLetter', postAppDetails).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Non-Disclosure Agreement Letter released successfully')
        setTimeout(() => {
          this.navigateDashboard();
          this.spinnerLoader1 = false;
        }, 1000);
        this.sendEmployeeDetails();
        this.signalService.AppointmentLetterNavCountSignal.set(true);
      },
      error: (reason: any) => {
        console.log(reason);
        this.signalService.AppointmentLetterNavCountSignal.set(true);
        this.conformationPopup.openErrorModal(reason.error.details)
        this.spinnerLoader = false;
      },
      complete: () => {
        this.spinnerLoader = false;
        this.spinnerLoader1 = false;
        this.signalService.AppointmentLetterNavCountSignal.set(true);
      }
    });
  }

  releaseLetter() {
    this.spinnerLoader1 = true;
    this.uploadAppointLetter();
    this.spinnerLoader1 = false;
  }

  sendEmployeeDetails() {
    this.selectedEmployee.substatus = 'NDA Letter Released'
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.selectedEmployee).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
      complete: () => {
        this.spinnerLoader = false;
        this.signalService.AppointmentLetterNavCountSignal.set(true);
      }
    });
  }

  uploadAppointLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Non-Disclosure Agreement Letter/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.AppointmentFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.postNDADetails(data.path);
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload  is failed')
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  //NDA letter email
  ndaLetterEmail(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      senderEmail: loggedInUser.workEmail,
      personEmail: this.selectedEmployee.emailaddress,
      senderName: `${loggedInUser.firstName ?? ''} ${loggedInUser.middleName ?? ''} ${loggedInUser.lastName ?? ''}`,
      personName: `${this.selectedEmployee.firstName ?? ""} ${this.selectedEmployee.middleName ?? ""} ${this.selectedEmployee.lastName ?? ""}`,
      appointee: `${this.selectedEmployee.firstName ?? ''} ${this.selectedEmployee.middleName ?? ''} ${this.selectedEmployee.lastName ?? ''}`,
      role: this.employeeJobDetails?.jobRole ?? '',
      department: this.employeeForm.get('department')?.value.departmentName,
      workLocation: (this.employeeJobDetails?.workLocation ?? '') + ", " + (this.employeeJobDetails?.subLocation ?? ''),
      documentUrl: docUrl,
      employeeId: this.selectedEmployee.employeeId,
      dateOfJoining: this.selectedEmployee.dateOfJoining,
      reportingManagerId: this.employeeJobDetails?.reportsto,
      teamManagerId: this.employeeJobDetails?.reportingmanagerId,
      reportingManagerName: `${this.employeeJobDetails?.fName ?? ''} ${this.employeeJobDetails?.mName ?? ''} ${this.employeeJobDetails?.lName ?? ''}`,
      teamManagerName: `${this.employeeJobDetails?.firstName ?? ''} ${this.employeeJobDetails?.middleName ?? ''} ${this.employeeJobDetails?.lastName ?? ''}`,
      generatedBy: loggedInUser.employeeId,
      generatedDate: new Date().toISOString(),
    }
    this.subscription = this.http.postdata(`CustomEmail/ndaletter`, emaildetails).subscribe({
      next: (data: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openSuccessModal('Email has been sent successfully');
      },
      error: (err: any) => {
        this.spinnerLoader = false;
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    })
  }

  //Post Asset Details
  assertdata = {} as any;
  postAssetDetails() {
    const formData = this.employeeForm.value;
    let postAssetDetails = {
      empid: this.selectedEmployee.employeeId,
      assetType: formData.assertType.assetType1,
      maker: null,
      model: formData.model,
      serialNumber: formData.serial,
    };
    this.subscription = this.http.postdata('AssetTable', postAssetDetails).subscribe({
      next: (data: any) => {
        this.assertdata = data;
        this.spinnerLoader = false;
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
    });
  }

  navigateDashboard() {
    this.router.navigate(['/employee-management/prospective/contract'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
