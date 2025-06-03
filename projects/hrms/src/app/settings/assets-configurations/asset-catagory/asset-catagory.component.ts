import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { HttpService } from '../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AssetCategory } from '../../../Interfaces/assets-management.model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-asset-catagory',
  imports: [ReactiveFormsModule, CommonModule, TranslateModule, NoDataFoundComponent],
  templateUrl: './asset-catagory.component.html',
  styleUrl: './asset-catagory.component.scss'
})

export class AssetCatagoryComponent {
  assetCategorydata!: FormGroup;
  assetCategorydataForm!: FormGroup;
  empinfo = {} as any;
  assetdataid: any
  destroy$: Subject<boolean> = new Subject<boolean>();
  assetCategorys = new BehaviorSubject<any>([]);

  constructor(
    public router: Router, private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService,
    private http: HttpService, public formValidation: FormValidationService, public rbac: RbacService) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initialassetform();
    this.getassetsCategory();
    this.initialassetformdata();
  }

  initialassetform() {
    this.assetCategorydata = this.fb.group({
      assetcaassetCategory: [null, [Validators.required, Validators.maxLength(30), Validators.pattern(/^[^\s].*$/)]],
    }
    )
  }

  initialassetformdata() {
    this.assetCategorydataForm = this.fb.group({
      assetcaassetCategorydata: [null, [Validators.required, Validators.maxLength(30), Validators.pattern(/^[^\s].*$/)]],
    }
    )
  }

  postasset(assetCategorydata: FormGroup) {
    if (assetCategorydata.valid) {
      const payload: AssetCategory = {
        name: assetCategorydata.get('assetcaassetCategory')?.value,
        parentId: 0,
        isDeleted: true,
        categoryContactNumber: this.assetCategorydata.get('categoryContactnumber')?.value,
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        meta: ''
      };
      this.http.postdata('AssetCategory', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Asset Category added successfully ');
          this.getassetsCategory()
          this.assetCategorydata.reset()
        },
        error: (error) => {
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('Asset category with the same Name already exists')
        },
      });
    } else {
    }
  }

  getassetsCategory() {
    this.http.getData('AssetCategory?parentId=0').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.assetCategorys.next(data);
      },
      error: (error) => {
        console.error("Error fetching asset categories:", error);
      }
    });
  }

  openupdate(content: any, data: any) {
    this.assetCategorydata.reset();
    this.assetdataid = data?.id
    this.assetCategorydataForm.patchValue({
      assetcaassetCategorydata: data?.name,
      categoryContactnumbers: data?.categoryContactNumber
    })
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  updateassetscategory(assetCategorydata: FormGroup) {
    if (assetCategorydata.valid) {
      const payload: AssetCategory = {
        name: assetCategorydata.get('assetcaassetCategorydata')?.value,
        parentId: 0,
        isDeleted: true,
        categoryContactNumber: 0,
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        meta: ''
      };
      this.http.putData(`AssetCategory/${this.assetdataid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Category updated successfully ');
            this.getassetsCategory()
          },
          error: (error) => {
            console.error("Error adding Asset Vendor:", error);
            this.conformationPopup.openErrorModal("Asset category with the same Name already exists!")
          }
        });
    } else {
      console.log("Asset Form is invalid.");
    }
  }

  //update close  button click open delet pop up dailog add vender
  openaddmodal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  
  //no button click close the  dailog add vender
  cleardata() {
    this.assetCategorydataForm.reset()
    this.modalService.dismissAll();
  }

  opendelete(content: any, data: any) {
    this.assetCategorydata.reset();
    this.assetdataid = data?.id
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  deleteasstescatagorydata() {
    this.http.deleteData(`AssetCategory/${this.assetdataid}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(' Asset Category deleted successfully');
        this.getassetsCategory()
        this.getassetsCategory()
      },
      error: (error) => {
        console.error("Error adding Asset Vendor:", error);
        this.modalService.dismissAll();
        this.conformationPopup.openErrorModal(error.error?.Message || 'Error occurred while adding asset vendor.',)
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}