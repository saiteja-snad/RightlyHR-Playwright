import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Vendor } from '../../../Interfaces/assets-management.model';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-asset-vendor',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NoDataFoundComponent],
  templateUrl: './asset-vendor.component.html',
  styleUrl: './asset-vendor.component.scss'
})

export class AssetVendorComponent {
  assetForm!: FormGroup;
  assetverderupdataform!: FormGroup;
  updatevedorid: any;
  selectedAsset:any
  vendor = new BehaviorSubject<Vendor[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo: any;

  constructor(
    public router: Router, 
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public formValidation: FormValidationService,
    public rbac: RbacService,
    
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getvendor()
    this.initialform()
    this.initialvedorupdateform()
  }

  initialform() {
    this.assetForm = this.fb.group({
      phonenumber: [null, [Validators.required, Validators.maxLength(15), Validators.minLength(10),Validators.pattern(/^(?!0{10,15}$)\d{10,15}$/),this.allZeroesIfMaxLength()]],
      vendordetailes: [null, [Validators.required, Validators.maxLength(50)]],
      email: [null, [Validators.required, Validators.email, Validators.maxLength(30), this.customEmailValidator()]],
      address: [null, [Validators.required, Validators.maxLength(100)]],
      secondaryphonenumber: [null, [Validators.required,Validators.maxLength(15), Validators.minLength(10),Validators.pattern(/^(?!0{10,15})\d{10,15}$/), this.allZeroesIfMaxLength()]],
    }
    )
  }

  initialvedorupdateform() {
    this.assetverderupdataform = this.fb.group({
      phonenumber: [null, [Validators.required, Validators.maxLength(15), Validators.minLength(10),Validators.pattern(/^(?!0{10,15}$)\d{10,15}$/),this.allZeroesIfMaxLength()]],
      vendordetailes: [null, [Validators.required, Validators.maxLength(50)]],
      email: [null, [Validators.required,Validators.email, Validators.maxLength(30),this.customEmailValidator()]],
      address: [null, [Validators.required, Validators.maxLength(100)]],
      secondaryphonenumber: [null, [Validators.maxLength(15), Validators.minLength(10),Validators.pattern(/^(?!0{10,15}$)\d{10,15}$/),this.allZeroesIfMaxLength()]],
    }
    )
  }
  // moreThanZeros(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: any } | null => {
  //     const value = control.value;
  //     const zeroCount = (value?.match(/0/g) || []).length;
  
  //     if (zeroCount > 9) {
  //       return { moreThanZeros: true };
  //     }
  //     return null;
  //   };
  // }
  allZeroesIfMaxLength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value || '');
      
      if (/^0{10,}$/.test(value)) {
        return { allZeroesIfMaxLength: true };
      }
  
      return null;
    };
  }
  
  
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.ngOnInit();
  }

  postvendor(assetForm: FormGroup) {
    if (assetForm.valid) {
      // Construct the payload for the API request
      const payload = {
        name: assetForm.value.vendordetailes,
        contactnumber: assetForm.value.phonenumber,
        emailaddress: assetForm.value.email,
        address: assetForm.value.address,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        secondaryContactNumber:this.assetForm.get('secondaryphonenumber')?.value || null,
        status: "Active",
        meta: 'Additional info'
      };
      this.http.postdata('AssetVendor', payload).pipe(takeUntil(this.destroy$)).subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Vendor Details added Successfully ');
            this.getvendor()
            this.assetForm.reset()
          },
          error: (error) => {
            this.modalService.dismissAll();
            if(error.status!==500){
              this.conformationPopup.openErrorModal(error.error?.message);
            }
            else{
              this.conformationPopup.openErrorModal("There was a problem on our side. Please try again later, or contact the administrator if the issue persists.")
            }
          }
        });
    } else {
      console.log("Asset Form is invalid.");
    }
  }

  customEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        return { invalidEmail: true }; // Returns error if email doesn't match regex
      }
      return null;
    }
  }

  getvendor() {
    this.http.getData('AssetVendor').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.vendor.next(res)
      },
      error: (errormessage) => {
        console.log(errormessage);
      }
    });
  }

  viewdata(data: any) {
    this.updatevedorid = data.id;
    this.assetverderupdataform.patchValue({
      phonenumber: data.contactnumber,
      vendordetailes: data.name,
      email: data.emailaddress,
      address: data.address,
      secondaryphonenumber:data.secondaryContactNumber
    })
  }

  updateinactivevendor(assetverderupdataform: FormGroup) {
    if (assetverderupdataform.valid) {
      const payload = {
        id: this.selectedAsset.id,
        name: this.selectedAsset.name,
        contactnumber:  this.selectedAsset.contactnumber,
        emailaddress: this.selectedAsset.emailaddress,
        address: this.selectedAsset.address,
        isDeleted: false,
        status:'Inactive',
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        meta: 'Additional info'
      };
      this.http.putData(`AssetVendor/${this.updatevedorid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(' Vendor Inactivated Successfully ');
            this.getvendor()
          },
          error: (error) => {
            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal( 'Email address already exit.',)
          }
        });
    } else {
      console.log("Asset Form is invalid.");
    }
  }
  updateactivevendor(assetverderupdataform: FormGroup) {
    if (assetverderupdataform.valid) {
      const payload = {
        id: this.selectedAsset.id,
        name: this.selectedAsset.name,
        contactnumber:  this.selectedAsset.contactnumber,
        emailaddress: this.selectedAsset.emailaddress,
        address: this.selectedAsset.address,
        isDeleted: false,
        status:'Active',
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        meta: 'Additional info'
      };
      this.http.putData(`AssetVendor/${this.updatevedorid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Vendor Activated Successfully ');
            this.getvendor()
          },
          error: (error) => {
            console.error("Error adding Asset Vendor:", error);

            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal( 'Email address already exit.',)

          }
        });
    } else {
      console.log("Asset Form is invalid.");
    }
  }

  updatevendor(assetverderupdataform: FormGroup) {
    if (assetverderupdataform.valid) {
      const payload = {
        id: this.updatevedorid,
        name: assetverderupdataform.value.vendordetailes,
        contactnumber: assetverderupdataform.value.phonenumber,
        secondaryContactNumber:assetverderupdataform.value.secondaryphonenumber || null,
        emailaddress: assetverderupdataform.value.email,
        address: assetverderupdataform.value.address,
        isDeleted: false,
        status:this.selectedAsset.status,
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        meta: 'Additional info'
      };
      this.http.putData(`AssetVendor/${this.updatevedorid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(' Vendor Details Updated Successfully ');
            this.getvendor()
          },
          error: (error) => {
            this.conformationPopup.openErrorModal( error.error.Message)
          },
        });
    } else {
      console.log("Asset Form is invalid.");
    }
  }
  //close button click open delet pop up dailog add vender
  openaddventermodal(content:any){
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  //no button click close the  dailog add vender
  cleardata(){
   this.assetForm.reset()
    this.modalService.dismissAll();
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}