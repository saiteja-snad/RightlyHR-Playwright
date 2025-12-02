import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-address-info',
  imports: [CommonModule, ReactiveFormsModule,Skeleton,NgbPopoverModule],
  templateUrl: './address-info.component.html',
  styleUrl: './address-info.component.scss'
})
export class AddressInfoComponent implements OnInit,OnDestroy{
  buttons = false;
  buttons2 = false;
  addressForm!: FormGroup;
  currentAddress: any;
  permanentAddress: any;
  subscription!: Subscription
  empinfo: any
  loading: boolean = false;
  employedata={} as any;
  isMyInfoRoute = false;
  fieldOptions = [] as any;
  getFieldsApprovalStatusList: any[] = [];
  activeMessage: string = '';


  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService,
     private http: HttpService,public formValidation: FormValidationService,public rbac: RbacService,private router: Router,public permissionRouteService: AccessForEmployeeinfoService, ) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.initializeForm();
    this.getFieldsApprovalStatus();
    this.addressForm.disable();
    this.addressForm.get('permanentAddress')?.valueChanges.subscribe(() => {
      this.checkIfAddressesAreSame();
    });

      this.addressForm.get('currentAddress')?.valueChanges.subscribe(() => {
      this.checkIfAddressesAreSame();
    });

  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.isMyInfoRoute = false;
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.isMyInfoRoute = true;
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
    }
  }
  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }



  initializeForm(): void {
    this.addressForm = this.fb.group({
      sameAsPermanent: [{value:false}], // Checkbox for "Same as Current Address"
      currentAddress: this.fb.group({
        addressLine1: ['', [Validators.required, Validators.maxLength(250)]],
        addressLine2: ['', [Validators.maxLength(250)]],
        city: ['', [Validators.required, Validators.maxLength(50)]],
        state: ['', [Validators.required, Validators.maxLength(50)]],
        country: ['', [Validators.required, Validators.maxLength(50)]],
        zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,10}$'), this.invalidZipCodeValidator()]],
      }),
      permanentAddress: this.fb.group({
        addressLine1: ['', [Validators.required, Validators.maxLength(150)]],
        addressLine2: ['',[Validators.maxLength(250)]],
        city: ['', [Validators.required, Validators.maxLength(50)]],
        state: ['', [Validators.required, Validators.maxLength(50)]],
        country: ['', [Validators.required, Validators.maxLength(50)]],
        zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,10}$'), this.invalidZipCodeValidator()]],
      }),
    });
  }

  invalidZipCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && /^0+$/.test(value)) {
        return { invalidZipCode: true }; // Return error if zip code is all zeros
      }
      return null; // Valid zip code
    };
  }

  enableForm(): void {
    this.buttons = true;
    this.addressForm.get('sameAsPermanent')?.enable();
    this.addressForm.get('currentAddress')?.enable(); // Enable all current address fields
    this.addressForm.get('permanentAddress')?.enable(); // Enable all permanent address fields
    this.disablePendingFields();
  }

  enableForm2(): void {
    this.buttons2 = true;
    this.addressForm.get('sameAsPermanent')?.enable();
    this.addressForm.get('permanentAddress')?.enable(); // Enable all permanent address fields
  }

  disableForm(): void {
    this.buttons = false;
    this.buttons2 = false;
    this.addressForm.disable();
    this.addressForm.reset();
    this.getEmployeeId();

  }

  getEmployeeId(): void {
    this.loading = true;
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
         this.loading = false;
        this.employedata = data;
        this.patchForm(data);

      },
      error: (reason: any) => {console.error('Error fetching employee data:', reason)
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        console.log('Employee data fetched successfully');
      }
    });
  }

  patchForm(data: any): void {
    this.currentAddress = data.employeeAddresses.find((address: any) => address.type === 'C');
    this.permanentAddress = data.employeeAddresses.find((address: any) => address.type === 'P');

    // Patch currentAddress fields
    this.addressForm.get('currentAddress')?.patchValue({
      addressLine1: this.currentAddress?.addressLine1 || '',
      addressLine2: this.currentAddress?.addressLine2 || '',
      city: this.currentAddress?.city || '',
      state: this.currentAddress?.state || '',
      country: this.currentAddress?.country || '',
      zipCode: this.currentAddress?.zipCode || '',
    });

    // Patch permanentAddress fields
    this.addressForm.get('permanentAddress')?.patchValue({
      addressLine1: this.permanentAddress?.addressLine1 || '',
      addressLine2: this.permanentAddress?.addressLine2 || '',
      city: this.permanentAddress?.city || '',
      state: this.permanentAddress?.state || '',
      country: this.permanentAddress?.country || '',
      zipCode: this.permanentAddress?.zipCode || '',
    });
    this.checkIfAddressesAreSame();
  }

  checkIfAddressesAreSame(): void {
    const currentAddress = this.addressForm.get('currentAddress')?.value;
    const permanentAddress = this.addressForm.get('permanentAddress')?.value;

    const areAddressesSame = JSON.stringify(currentAddress) === JSON.stringify(permanentAddress);

    // Update the checkbox value based on the comparison
    this.addressForm.get('sameAsPermanent')?.setValue(areAddressesSame, { emitEvent: false });
  }

  updateAddressInfo(): void {
    const formValue = this.addressForm.value; // Get updated form values

    // Ensure the existing address object remains unchanged while updating fields
    this.currentAddress = this.currentAddress
      ? {
          ...this.currentAddress,
          addressLine1: formValue.currentAddress.addressLine1 || this.currentAddress.addressLine1,
          addressLine2: formValue.currentAddress.addressLine2 || this.currentAddress.addressLine2,
          city: formValue.currentAddress.city || this.currentAddress.city,
          type: 'C',
          empId: this.empinfo.employeeId,
          state: formValue.currentAddress.state || this.currentAddress.state,
          country: formValue.currentAddress.country || this.currentAddress.country,
          zipCode: formValue.currentAddress.zipCode || this.currentAddress.zipCode,
        }
      : null;

    this.permanentAddress = this.permanentAddress
      ? {
          ...this.permanentAddress,
          addressLine1: formValue.permanentAddress.addressLine1 || this.permanentAddress.addressLine1,
          addressLine2: formValue.permanentAddress.addressLine2 || this.permanentAddress.addressLine2,
          city: formValue.permanentAddress.city || this.permanentAddress.city,
          type: 'P',
          empId: this.empinfo.employeeId,
          state: formValue.permanentAddress.state || this.permanentAddress.state,
          country: formValue.permanentAddress.country || this.permanentAddress.country,
          zipCode: formValue.permanentAddress.zipCode || this.permanentAddress.zipCode,
        }
      : null;

    // Debugging Log - Ensure both addresses are updated properly
    console.log('Updated Current Address:', this.currentAddress);
    console.log('Updated Permanent Address:', this.permanentAddress);

    // Prepare payload for employee details update
    const updatePayload = {
      ...this.employedata,
      currentAddress: this.currentAddress,
      permanentAddress: this.permanentAddress,


  selfUpdate: this.isMyInfoRoute,
  moduleName: this.isMyInfoRoute ? 'Address Info' : undefined,
  displayName: this.isMyInfoRoute ? 'Personal' : undefined,
    };

    // Send employee basic details update
    this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload).subscribe({
      next: (data: any) => {
        console.log('Data updated successfully:', data);

        this.modalService.dismissAll();
        this.postEmployeeAddresses(); // Ensure updated addresses are sent
        // this.conformationPopup.openSuccessModal('Address Info updated successfully');
      },
      error: (reason: any) => {
        console.log(reason);
         this.conformationPopup.openErrorModal(reason.error.message);
      },
    });
  }

  postEmployeeAddresses(): void {
    // Update currentAddress and permanentAddress with the latest form values
    const formValue = this.addressForm.getRawValue();

    this.currentAddress = {
      ...this.currentAddress,
      addressLine1: formValue.currentAddress.addressLine1,
      addressLine2: formValue.currentAddress.addressLine2,
      city: formValue.currentAddress.city,
      type: 'C',
      empId: this.empinfo.employeeId,
      state: formValue.currentAddress.state,
      country: formValue.currentAddress.country,
      zipCode: formValue.currentAddress.zipCode,
      updatedBy: this.empinfo.employeeId,
      selfUpdate: this.isMyInfoRoute,
      moduleName: 'Addresses',
      displayName: 'Personal',
      referenceCategory: 'C',
    };

    this.permanentAddress = {
      ...this.permanentAddress,
      addressLine1: formValue.permanentAddress.addressLine1,
      addressLine2: formValue.permanentAddress.addressLine2,
      city: formValue.permanentAddress.city,
      type: 'P',
      empId: this.empinfo.employeeId,
      state: formValue.permanentAddress.state,
      country: formValue.permanentAddress.country,
      zipCode: formValue.permanentAddress.zipCode,
      updatedBy: this.empinfo.employeeId,
      selfUpdate: this.isMyInfoRoute,
      moduleName: 'Addresses',
      displayName: 'Personal',
      referenceCategory: 'P',
    };

    // Prepare the payload
    const payload = {
      employeeAddresses: [this.currentAddress, this.permanentAddress],
    };
    console.log('Payload:', payload);

    // Send the updated payload
    this.subscription = this.http.postdata('EmployeeAddress', payload).subscribe({
      next: (data: any) => {
        console.log('Addresses updated successfully:', data);
        this.addressForm.disable();
        this.getEmployeeId();
        this.getFieldsApprovalStatus();
        this.buttons = false;
        this.buttons2 = false;
        this.conformationPopup.openSuccessModal('Addresses updated successfully');
      },
      error: (reason) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Addresses  update failed');
      },
    });
  }

  copyCurrentAddress(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.addressForm.get('permanentAddress')?.patchValue({
        addressLine1: this.addressForm.get('currentAddress.addressLine1')
          ?.value,
        addressLine2: this.addressForm.get('currentAddress.addressLine2')
          ?.value,
        city: this.addressForm.get('currentAddress.city')?.value,
        state: this.addressForm.get('currentAddress.state')?.value,
        country: this.addressForm.get('currentAddress.country')?.value,
        zipCode: this.addressForm.get('currentAddress.zipCode')?.value,
       
      });
    } else {
      this.addressForm.get('permanentAddress')?.patchValue({
        addressLine1: this.permanentAddress?.addressLine1 || '',
        addressLine2: this.permanentAddress?.addressLine2 || '',
        city: this.permanentAddress?.city || '',
        state: this.permanentAddress?.state || '',
        country: this.permanentAddress?.country || '',
        zipCode: this.permanentAddress?.zipCode || '',
        
      });
    }

    this.checkIfAddressesAreSame();
  }
  getFieldsApprovalStatus() {
    const params = {
      displayName: 'Personal',
      moduleName: 'Addresses',
      employeeId: parseInt(this.empinfo.employeeId),
    };
    this.subscription = this.http
      .getDataIncludeParams(
        `EmployeeInfoFieldUpdate/getLatestFieldApprovalStatus`,
        params
      )
      .subscribe({
        next: (data: any) => {
          if (data.data.length > 0) {
            this.getFieldsApprovalStatusList = data.data;
          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
      });
  }

  isFieldPendingApproval(fieldName: string): boolean {
    console.log('Checking pending approval for field:', fieldName ,this.getFieldsApprovalStatusList);
    return this.getFieldsApprovalStatusList.some(
      (item: any) =>
        item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
  }


  getPendingApprovalMessage(fieldName: string): string {
    const pendingItem = this.getFieldsApprovalStatusList.find(
      (item: any) =>
        item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
    return (
      pendingItem?.message || 'This field change request is awaiting approval.'
    );
  }

  setActiveMessage(fieldName: string) {
  this.activeMessage = this.getPendingApprovalMessage(fieldName);
}

  // Add this method
  isFieldDisabledDueToPending(fieldName: string): boolean {
    return this.isFieldPendingApproval(fieldName);
  }
   // Add this new method
 private disablePendingFields(): void {
  const pendingFields = this.getFieldsApprovalStatusList
    .filter(item => item.approvalStatus === 'Pending')
    .map(item => item.fieldName);

  const controlMap: { [key: string]: string } = {
    // Current Address fields
    'Current Address Line 1': 'currentAddress.addressLine1',
    'Current Address Line 2': 'currentAddress.addressLine2',
    'Current City': 'currentAddress.city',
    'Current State': 'currentAddress.state',
    'Current Country': 'currentAddress.country',
    'Current ZipCode': 'currentAddress.zipCode',

    // Permanent Address fields
    'Permanent Address Line 1': 'permanentAddress.addressLine1',
    'Permanent Address Line 2': 'permanentAddress.addressLine2',
    'Permanent City': 'permanentAddress.city',
    'Permanent State': 'permanentAddress.state',
    'Permanent Country': 'permanentAddress.country',
    'Permanent ZipCode': 'permanentAddress.zipCode'
  };

  pendingFields.forEach((fieldName) => {
    const controlPath = controlMap[fieldName];

    if (controlPath && this.addressForm.get(controlPath)) {
      this.addressForm.get(controlPath)?.disable();
    }
  });
}
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}



