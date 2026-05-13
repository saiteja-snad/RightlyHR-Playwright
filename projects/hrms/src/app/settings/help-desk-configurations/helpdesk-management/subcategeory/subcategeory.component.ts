import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SelectModule } from 'primeng/select';
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { subLocationDatas } from '../module/subLocationData';
import { Paginator } from "primeng/paginator";
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
@Component({
  selector: 'app-subcategeory',
  imports: [CommonModule, ReactiveFormsModule,FormsModule ,TranslateModule, SelectModule, NgbPopoverModule, InfoIconComponent, DataLoaderContentComponent, Paginator, NoDataFoundComponent],
  templateUrl: './subcategeory.component.html',
  styleUrl: './subcategeory.component.scss'
})
export class SubcategeoryComponent {
subscription!: Subscription;
  SubCategeorydetails = [] as any;
  loader = false;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteRole: any = null;
  categeoryDetail: any;
  locationDetail:any;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  employeedata: any;
    page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
this.AddForm = this.fb.group({
  Addcategeory: [null, [Validators.required]],
  Addsubcategeory: [
    '',
    [
      Validators.required,
      this.formValidations.maxCharactersValidator(101),
      Validators.pattern(/^[^\s].*$/)
    ]
  ]
});

    this.updateForm = this.fb.group({
      updatecategeory: ['', [Validators.required]],
      UpdateSubCategeory: ['',
    [
      Validators.required,
      this.formValidations.maxCharactersValidator(101),
      Validators.pattern(/^[^\s].*$/)
    ]],
    });
    this.getSubCategeory();
    this.getcategeorydetails();
      this.employeedata =  JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

  }
  getcategeorydetails() {
    this.http.getData('HelpDeskCategory').subscribe((data: any) => {
      this.categeoryDetail = data.data;
       this.locationDetail = data.categeoryname;
      console.log("joblocation", this.categeoryDetail);
    });
  }
  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
// Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getSubCategeory(this.page, this.pageSize);
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
   this.getSubCategeory(this.page, this.pageSize);
  }

  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getSubCategeory(this.page, this.pageSize);
  }

  getSubCategeory(page?: number, pageSize?: number) {
    this.loader = true;
    this.subscription = this.http.getData(`HelpDeskSubCategory?pageNumber=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (data: any) => {
        this.loader = false;
        console.log(data);
        this.SubCategeorydetails = data.data;
        this.collectionSize = data.totalCount;
      },
      error: (error: any) => {
        this.loader = false;

      }
    });
  }
  //ADD
 addSubcategeory(modal: any) {
  if (this.AddForm.invalid) return;


  const request = {
    categoryId: this.AddForm.value.Addcategeory,
    subcategoryName: this.AddForm.value.Addsubcategeory.trim(),
    isDeleted: false,
    createdDate: new Date(),
    createdBy: parseInt(this.employeedata?.employeeId)
  };

  this.subscription = this.http.postdata('HelpDeskSubCategory', request)
    .subscribe({
      next: () => {
        this.getSubCategeory();
        modal.close();
        this.conformationPopup.openSuccessModal('Subcategory added successfully');
        this.AddForm.reset();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
}
  close(modal: any) {
    modal.close();
  }
  // Method to open the update modal dialog
openupdateDialog(jobroletypelist: any) {
  this.selectedId = jobroletypelist.id;

  this.updateForm.patchValue({
    updatecategeory: jobroletypelist.categoryId,   //patch ID
    UpdateSubCategeory: jobroletypelist.subcategoryName
  });

  this.modalService.open(this.updatepopup, {
    backdrop: 'static',
    centered: true
  });
}

  //  UPDATE
  updateSubcategeory(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: subLocationDatas = {
        id: this.selectedId,
        isDeleted: false,
        updatedBy: this.employeedata?.employeeId,
        updatedDate: new Date(),
        subcategoryName: this.updateForm.value.UpdateSubCategeory.trim(),
        categoryId: this.updateForm.value.updatecategeory,

      };

      this.subscription = this.http.putData(`HelpDeskSubCategory/${this.selectedId}`, request).subscribe({
        next: () => {
          this.getSubCategeory();
          modal.close();
          this.conformationPopup.openSuccessModal('Subcategory updated successfully');
          this.resetForm();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  }
  //  Method to open the delete modal dialog
  //  DELETE
  opendelete(categeorytypelist: any) {
    this.selectedDeleteRole = categeorytypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  onDelete(modal: any) {
    if (!this.selectedDeleteRole) return;
    this.subscription = this.http.deleteData(`HelpDeskSubCategory/${this.selectedDeleteRole.id}`)
      .subscribe({
        next: () => {
          modal.close();
          this.getSubCategeory();
          this.conformationPopup.openSuccessModal('Subcategory deleted successfully');
        },
        error: (error: any) => {
          const errorMessage = error.error;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
  }

  closeDelete(modal: any) {
    modal.dismiss();
  };

  resetForm() {
    this.AddForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
