import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { IAddress, IemployeeDetails } from '../appointment-letter/appointment-letter-model';
import { IAuthority } from '../../Interfaces/letters-model';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../letters-builder-files/custom-fonts-vfs';
import { buildAddressLetterDoc } from '../../letters-builder-files/address-letter.builder';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { fetchLetterAssets, setupLetterPdfMake } from '../../letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-address-proof-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, TranslateModule, NgbPopoverModule, LetterFooterComponent, LettersheaderComponent],
  templateUrl: './address-proof-letter.component.html',
  styleUrl: './address-proof-letter.component.scss'
})

export class AddressProofLetterComponent implements OnInit, OnDestroy {
  addressdata: { name: string, value: string }[] = [
    { name: 'Current Address', value: 'C' },
    { name: 'Permanent Address', value: 'P' },
  ];
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  employeeForm!: FormGroup;
  selectedEmployee: any;
  subscription!: Subscription;
  fusionEmpId: any;
  employeeiddetails: any[] = [];
  addressLetterData = {} as any;
  employeeJobDetails = {} as any;
  addressFile!: File;
  isdateofaddress: boolean = true;
  Employeeinfo = {} as any;
  employeedata = {} as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  authorityName: any;
  signatureAuthorityName!: string | null
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  disablebuttonforemployeeid: boolean = true;
  disablebuttonforauthority: boolean = true;
  SelectDropDown: any;
  employeeaddress = [] as any;
  Status: any;
  address = {} as IAddress;
  addressFlag = false;
  addressErrorMessage = '';
  spinnerLoader = false;
  lastSelectedEmployeeId: string | null = null;

  constructor(private http: HttpService, private router: Router, private fb: FormBuilder, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
      ...emp,
      fullName: `${emp.firstName} ${emp.middleName} ${emp.lastName}`,
    }));
    this.authorityDetails = this.authorityDetails.map((authority: IAuthority) => ({
      ...authority,
      fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim(),
    }));
    this.initializeForm();
    this.getEmployeeId();
    this.getAuthorityDetails();
    this.addressdata = this.employeeaddress?.employeeAddresses && Array.isArray(this.employeeaddress.employeeAddresses)
      ? this.employeeaddress.employeeAddresses.map((addr: { type: string }) => ({
        label: addr.type === 'C' ? 'Current Address' : 'Permanent Address',
        value: addr.type
      })) : [];
  }

  addressOptions = [
    { label: 'Current Address', value: 'C' },
    { label: 'Permanent Address', value: 'P' }
  ];

  navigateDashboard() {
    this.router.navigate(['/employee-management/all-employees'])
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: ['', Validators.required],
      Documenttype: ['', Validators.required],
      SelectDropDown: ['', Validators.required],
      authorityid: ['', Validators.required],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      jobRole: [''],
      effectiveDate: [''],
      dateOfJoining: [null],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
      authorityName: [''],
      authorityDesignation: ['']
    });
  }

  Onclick(selectedEmployee: any) {
    console.log(selectedEmployee);
    
    if (!selectedEmployee || typeof selectedEmployee !== 'object' || !selectedEmployee.hasOwnProperty('employeeId')) {
      return;
    }
    if (this.lastSelectedEmployeeId && this.lastSelectedEmployeeId !== selectedEmployee.employeeId) {
      this.employeeForm.patchValue({
        SelectDropDown: '',
        Documenttype: '',
        authorityid: ''
      });
      ['SelectDropDown', 'Documenttype', 'authorityid'].forEach(controlName => {
        const control = this.employeeForm.get(controlName);
        control?.markAsPristine();
        control?.markAsUntouched();
        control?.updateValueAndValidity();
      });
    }
    this.lastSelectedEmployeeId = selectedEmployee.employeeId;
    this.fusionEmpId = selectedEmployee.employeeId;
    this.addressLetterData = {};
    this.addressLetterData = this.employeeiddetails.find((c: any) => c.employeeId === this.fusionEmpId);
    if (!this.addressLetterData) {
      return;
    }
    let selectedAddress = this.addressLetterData.address || {};
    if (!selectedAddress || Object.keys(selectedAddress).length === 0) {
      console.log('No address found for the selected type');
    }
    this.employeeForm.patchValue({
      employeeId: this.addressLetterData.employeeId || '',
      firstName: this.addressLetterData.firstName || '',
      middleName: this.addressLetterData.middleName || '',
      lastName: this.addressLetterData.lastName || '',
      jobRole: 'Fetching...',
      dateOfJoining: this.addressLetterData.dateOfJoining || '',
      authorityDesignation: this.addressLetterData.authorityDesignation || '',
      authorityName: this.addressLetterData.authorityName || '',
      addressLine1: selectedAddress?.addressLine1 || '',
      addressLine2: selectedAddress?.addressLine2 || '',
      city: selectedAddress?.city || '',
      state: selectedAddress?.state || '',
      country: selectedAddress?.country || '',
      zipCode: selectedAddress?.zipCode || ''
    });
    if (this.addressLetterData.employeeId) {
      this.getEmployeeAddress(this.addressLetterData);
      this.getJobdetails(this.addressLetterData);
    }
    this.disablebuttonforemployeeid = true;
  }

  getEmployeeAddress(Value: any) {
    let EmployeeId = Value.employeeId;
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        const address = data.employeeAddresses
        if (!address || address.length === 0) {
          this.addressErrorMessage = 'No address found for the selected employee';
        } else {
          this.addressErrorMessage = '';
        }
      }
    })
  }

  onclickSelectAddress(event: any) {
    const selectedValue = event.value.value;
    const selectedAddress = this.employeeaddress?.employeeAddresses?.find(
      (addr: { type: string }) => addr.type.toLocaleLowerCase() === selectedValue.toLocaleLowerCase()
    );
    if (selectedAddress) {
      this.employeeForm.patchValue({
        addressLine1: selectedAddress.addressLine1 || '',
        addressLine2: selectedAddress.addressLine2 || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        country: selectedAddress.country || '',
        zipCode: selectedAddress.zipCode || '',
      });
      this.addressFlag = true;
    } else {
      this.addressFlag = false;
      this.addressErrorMessage = 'No address found for the selected type';
    }
  }

  onclickauthority(ValueName: any) {
    this.authorityName = ValueName
    if (this.authorityName == "") {
      this.disablebuttonforauthority = true;
    } else {
      this.disablebuttonforauthority = false;
    }
    let authorityDesignationdata = this.authorityDetails.find(
      (c: any) => c.firstName + ' ' + c.middleName + ' ' + c.lastName === ValueName
    );
    if (authorityDesignationdata.middleName === null) {
      this.signatureAuthorityName = JSON.parse(JSON.stringify(
        authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.lastName
      ));
    }
    this.authorityDesignation = authorityDesignationdata?.designation;
    this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' +
      authorityDesignationdata?.middleName + authorityDesignationdata?.lastName))
    if (this.authorityName) {
      if (this.authorityName === this.signatureAuthorityName) {
        this.disablebuttonforauthority = true;
      } else {
        this.disablebuttonforauthority = false;
      }
    }
    if (authorityDesignationdata == undefined) {
      this.authorityDesignation = null;
      this.signatureAuthorityName = null;
    }
  }

  onclickDesignation(selectedAuthority: any) {
    if (!selectedAuthority) {
      this.addressLetterData.authorityName = '';
      this.authorityDesignation = '';
      return;
    }
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == selectedAuthority.employeeId
    );
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      this.addressLetterData.authorityName = signatureAuthorityDetails.middleName
        ? `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`
        : `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    } else {
      this.addressLetterData.authorityName = '';
      this.authorityDesignation = '';
    }
  }

  getAuthorityDetails() {
    let offertype = 'Address Proof Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName ? authority.middleName + ' ' : ''}${authority.lastName}`
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''}${employee.firstName} 
              ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getJobdetails(Employee: any) {
    if (!Employee || !Employee.employeeId) {
      console.warn("Invalid employee for job details:", Employee);
      return;
    }
    this.subscription = this.http.getData(`JobDetails/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          let res = data.sort(
            (a: any, b: any) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
          )[0];
          this.employeeJobDetails = res;
          Employee.jobRole = res.jobRole;
          Employee.workLocation = res.location;
          this.employeeForm.patchValue({
            jobRole: Employee.jobRole || 'Not Available',
            effectiveDate: res.effectiveDate ? new Date(res.effectiveDate) : null
          });
        } else {
          console.warn("No job details found for employeeId:", Employee.employeeId);
          this.employeeForm.patchValue({
            jobRole: 'Not Available',
            effectiveDate: null
          });
        }
      },
      error: (err: any) => {
        console.error("Error fetching job details:", err);
        this.employeeForm.patchValue({
          jobRole: 'Not Available',
          effectiveDate: null
        });
      },
    });
  }

  async postAddressLetterFormSubmit(f: FormGroup) {
    this.spinnerLoader = true;
    const formVal = f.value;
    if (!formVal.firstName || !formVal.lastName) {
      console.error('Employee name is missing');
      this.spinnerLoader = false;
      return;
    }
    const fileName = `${formVal?.firstName}_${formVal.lastName}_${Date.now()}_AddressProofLetter.pdf`;
    const isSoftCopy = f.value.Documenttype?.value === true;
    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);
    const docDef = buildAddressLetterDoc({
      firstName: formVal.firstName,
      middleName: formVal.middleName || '',
      lastName: formVal.lastName,
      jobRole: formVal.jobRole || '',
      effectiveDate: formVal.effectiveDate ? new Date(formVal.effectiveDate).toISOString() : '',
      addressLine1: formVal.addressLine1 || '',
      addressLine2: formVal.addressLine2 || '',
      city: formVal.city || '',
      state: formVal.state || '',
      country: formVal.country || '',
      zipCode: formVal.zipCode || '',
      letterDate: new Date().toISOString(),
      authorityFullName: this.addressLetterData.authorityName || '',
      authorityDesignation: this.authorityDesignation || '',
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
      this.addressFile = new File([blob], fileName, { type: 'application/pdf' });
      this.uploadAddressLetter();
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
      this.conformationPopup.openErrorModal('Failed to generate Address Proof Letter');
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

  uploadAddressLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Address Proof Letters/${this.addressLetterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.addressFile).subscribe({
      next: (_data: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openSuccessModal('Address proof letter generated successfully');
        this.resetForm();
      },
      error: (_err: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('file upload is failed');
      }
    });
  }

  private resetForm() {
    this.initializeForm();
    this.addressLetterData = {};
    this.authorityDesignation = null;
    this.signatureAuthorityName = null;
    this.addressFlag = false;
    this.addressErrorMessage = '';
    this.lastSelectedEmployeeId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}