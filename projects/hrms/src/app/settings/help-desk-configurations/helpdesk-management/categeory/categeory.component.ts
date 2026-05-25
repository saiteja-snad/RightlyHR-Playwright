import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SelectModule } from 'primeng/select';
import { InfoIconComponent } from '../../../../icons/info-icon/info-icon.component';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { JobLocations } from '../module/locationModule';
import { ModuleInformationComponent } from "../../../../shared/module-information/module-information.component";
import { Paginator } from "primeng/paginator";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-categeory',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    FormsModule,
    NgbPopoverModule,
    InfoIconComponent,
    DataLoaderContentComponent,
    ModuleInformationComponent,
    Paginator,
    NoDataFoundComponent
],
  templateUrl: './categeory.component.html',
  styleUrl: './categeory.component.scss',
})
export class CategeoryComponent {
  subscription!: Subscription;
  Categeorydetails = [] as any;
  JobroleDetails = [] as any;
  loader = false;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteRole: any = null;
  departmentDetail: any;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  empinfo: any;
  empdata: any;
  moduleinfo: string = '';
  employeedata: any;
  helpdesklist:any;
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
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('currentUser') ?? '{}');
    this.AddForm = this.fb.group({
      // Adddepartment: [null, Validators.required],
      Addcategeory: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(250),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
    });
    this.updateForm = this.fb.group({
      // updatedepartment: [null, Validators.required],
      updatecategeory: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(101),
          Validators.pattern(/^[^\s].*$/),
        ],
      ],
    });
    this.getcatageory();
    // this.getDepartment();
  }
  // getDepartment() {
  //   this.http.getData('Department').subscribe((data: any) => {
  //     this.departmentDetail = data;
  //     console.log('department', this.departmentDetail);
  //   });
  // }
  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true,
    });
  }
// Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getcatageory(this.page, this.pageSize);
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
   this.getcatageory(this.page, this.pageSize);
  }

  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getcatageory(this.page, this.pageSize);
  }


  getcatageory(page?: number, pageSize?: number) {
    this.loader = true;
    this.subscription = this.http.getData(`HelpDeskCategory?pageNumber=${this.page}&pageSize=${this.pageSize}`).subscribe({
      next: (data: any) => {
        this.loader = false;
        console.log(data);
       this.Categeorydetails = data.data;
          this.collectionSize = data.totalCount;
      },
      error: (error: any) => {
        this.loader = false;
      },
    });
  }
  //ADD
  addcagegeory(modal: any) {
    if (this.AddForm.invalid) return;
    this.employeedata = JSON.parse(
      localStorage.getItem('rightlyHrUser') || '{}',
    );

    const request = {
      categoryName: this.AddForm.value.Addcategeory.trim(),
      isDeleted: false,
      createdDate: new Date(),
      createdBy: this.employeedata.employeeId, // replace with logged in user id
      // departmentId: this.AddForm.value.Adddepartment,
    };

    this.subscription = this.http
      .postdata('HelpDeskCategory', request)
      .subscribe({
        next: () => {
          this.getcatageory(); // refresh list
          modal.close();
          this.conformationPopup.openSuccessModal(
            'Category added successfully',
          );
          this.AddForm.reset();
        },
        error: (error: any) => {
          const errorMessage = error.error?.message;
          this.conformationPopup.openErrorModal(errorMessage);
        },
      });
  }

  close(modal: any) {
    modal.close();
  }
  // Method to open the update modal dialog
  openupdateDialog(data: any) {
    this.selectedId = data.id;

    this.updateForm.patchValue({
      // updatedepartment: data.departmentId, // ✅ must be ID (sno)
      updatecategeory: data.categoryName,
    });

    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  //  UPDATE
  updateCategeory(modal: any) {
    if (this.updateForm.invalid || !this.selectedId) return;

    const request = {
      id: this.selectedId,
      categoryName: this.updateForm.value.updatecategeory.trim(),
      isDeleted: false,
      updatedDate: new Date().toISOString(),
      updatedBy: this.empinfo.employeeId,
      // departmentId: this.updateForm.value.updatedepartment,
    };

    this.subscription = this.http
      .putData(`HelpDeskCategory/${this.selectedId}`, request)
      .subscribe({
        next: () => {
          this.getcatageory();
          modal.close();
          this.conformationPopup.openSuccessModal(
            'Category updated successfully',
          );
          this.updateForm.reset();
        },
        error: (error: any) => {
          const errorMessage = error.error?.message;
          this.conformationPopup.openErrorModal(errorMessage);
        },
      });
  }

  //  Method to open the delete modal dialog
  //  DELETE
  opendelete(categeorylist: any) {
    this.selectedDeleteRole = categeorylist;
    this.modalService.open(this.deletepopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  onDelete(modal: any) {
    if (!this.selectedDeleteRole) return;

    const updatedBy = this.empinfo.employeeId; // logged in user id

    this.subscription = this.http
      .deleteData(`HelpDeskCategory/${this.selectedDeleteRole.id}`)
      .subscribe({
        next: () => {
          modal.close();
          this.getcatageory();
          this.conformationPopup.openSuccessModal(
            'Category deleted successfully',
          );
        },
        error: (error: any) => {
          const errorMessage = error.error?.message;
          this.conformationPopup.openErrorModal(errorMessage);
        },
      });
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

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
