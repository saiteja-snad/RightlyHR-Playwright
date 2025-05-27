import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AssetCategory } from '../../../Interfaces/assets-management.model';
import { Select } from 'primeng/select';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-sub-catagory',
  imports: [NoDataFoundComponent, CommonModule, ReactiveFormsModule, TranslateModule, Select],
  templateUrl: './sub-catagory.component.html',
  styleUrl: './sub-catagory.component.scss'
})

export class SubCatagoryComponent {
  assetcataeryForm!: FormGroup;
  assetCategorys: any[] = [];
  assetcataeryupdateForm!: FormGroup
  categoridata = new BehaviorSubject<any[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo: any;
  category!: any
  assetSubCategory: any[] = [];
  selectedid: any
  assetdataid: any;

  constructor(
    public router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public formValidation: FormValidationService,
    public rbac: RbacService
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getassetsCategory();
    this.getsubcategorys();
    this.intialasetsubcatary();
    this.intialupdateasetsubcatarys();
  }

  intialasetsubcatary() {
    this.assetcataeryForm = this.fb.group({
      assetCategoryvalue: [null, Validators.required],
      assetSubCategory: [{ value: null, disabled: true }, [Validators.required, Validators.maxLength(30), Validators.pattern(/^[^\s].*$/)]],
    })
  }

  intialupdateasetsubcatarys() {
    this.assetcataeryupdateForm = this.fb.group({
      assetCategory: [{ value: null, disabled: true }, Validators.required],
      assetSubCategory: [null, [Validators.required, Validators.maxLength(30), Validators.pattern(/^[^\s].*$/)]],
    })
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true })
  }
   //add close button click open delet pop up dailog add vender
   openaaddmodal(content:any){
  this.modalService.open(content, { centered: true, backdrop: 'static' });
}
//no button click close the  dailog add vender
clearadddata(){
 this.assetcataeryForm.reset()
  this.modalService.dismissAll();
}
 //update close  button click open delet pop up dailog add vender
 openaddventermodal(content:any){
  this.modalService.open(content, { centered: true, backdrop: 'static' });
}
//no button click close the  dailog add vender
cleardata(){
 this.assetcataeryupdateForm.reset()
  this.modalService.dismissAll();
}
  getassetsCategory() {
    this.http.getData('AssetCategory?parentId=0')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assetCategorys = data;
        },
        error: (error) => {
          console.error("Error fetching asset categories:", error);
        }
      });
  }

  getsubcategorys() {
    this.http.getData('AssetCategory')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.categoridata.next([]);
          this.categoridata.next(data);
          this.filterCategoryData()
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getAssetCatData(parentId: any) {
    // Check if assetCategorys has a value before finding the category
    this.category = this.assetCategorys.find((t) => parseInt(parentId) === t.id);
    return this.category ? this.category.name : 'N/A';
  }

  filterdata: any[] = [];
  filterCategoryData() {
    const currentCategoryData = this.categoridata.getValue();
    // Filter the data and create an updated array
    const updatedCategoryData = currentCategoryData.filter((item: any) => {
      // Find item where id matches parentId and parentId is not 0
      if (item.parentId !== 0) {
        const foundItemIndex = currentCategoryData.findIndex(
          (innerItem: any) => innerItem.id === item.parentId && innerItem.parentId !== 0
        );
        if (foundItemIndex !== -1) {
          // If found, push the found item to filterdata
          return false;
        }
        return true;
      }
      return false;
      // Keep items that don't match
    });

    // Now update the BehaviorSubject with the updated data
    this.categoridata.next(updatedCategoryData);
  }

  postassetscatry(assetcataeryForm: FormGroup) {
    if (assetcataeryForm.valid) {
      const payload: AssetCategory = {
        name: assetcataeryForm.get('assetSubCategory')?.value,
        isDeleted: true,
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        parentId: this.assetcataeryForm.get('assetCategoryvalue')?.value,
        meta: '',
      };
      this.http.postdata('AssetCategory', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Asset Sub category added Successfully ');
            this.getsubcategorys()
            this.assetcataeryForm.reset()
          },
          error: (error) => {
            this.conformationPopup.openErrorModal(error.error?.message)
          }
        });
    } else {
      console.log("Asset Form is invalid.");
    }
  }

  onassetsubcategory() {
    this.assetcataeryForm.get('assetSubCategory')?.enable()
    const selectedId = this.assetcataeryForm.get('assetCategoryvalue')?.value;
    this.http
      .getData(`AssetCategory?parentId=${selectedId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assetSubCategory = data;
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  openupdate(content: any, data: any) {
    this.assetdataid = data?.id
    this.assetcataeryupdateForm.patchValue({
      assetCategory: data.parentId,
      assetSubCategory: data.name,
    })
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  updateastessubcategory(assetcataeryForms: FormGroup) {
    if (assetcataeryForms.valid) {
      const payload: AssetCategory = {
        name: assetcataeryForms.get('assetSubCategory')?.value,
        isDeleted: true,
        createdAt: new Date().toISOString(),
        createdBy: this.empinfo.employeeId,
        parentId: this.assetcataeryupdateForm.get('assetCategory')?.value,
        meta: ''
      };
      this.http.putData(`AssetCategory/${this.assetdataid}`, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(' Asset Sub category Updated successfully ');
            this.getsubcategorys()
            this.assetcataeryForm.reset()
          },
          error: (error) => {
           // this.modalService.dismissAll();
            this.conformationPopup.openErrorModal(error.error?.Message || 'Error occurred while adding Sub category.',)          
          }
        });
    } else {
      console.log("Asset Form is invalid.");
    }
  }

  opendelete(content: any, data: any) {
    this.assetdataid = data?.id
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  deleteasstescatagorydata() {
    this.http.deleteData(`AssetCategory/${this.assetdataid}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(' Asset Category Deleted successfully');
          this.getsubcategorys()
        },
        error: (error) => {
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal(error.error?.Message || 'Error occurred while adding asset vendor.',)
        }
      });
  }
}