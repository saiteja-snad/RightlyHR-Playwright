import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { Subscription } from 'rxjs';
import { IemployeeDetails, ISignatureAuthority, ISignatureList } from './signature-authority.model';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-signature-authority',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './signature-authority.component.html',
  styleUrl: './signature-authority.component.scss',
})
export class SignatureAuthorityComponent implements OnInit {
  subscription!: Subscription;
  AddForm!: FormGroup;
  UpdateForm!: FormGroup;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  signatureEmployeesList: any[] = [];
  signatureLetterTypes: ISignatureAuthority[] = [];
  employeeiddetails: IemployeeDetails[] = [];
  selectedId: number | null = null;
  selectedDeleteserving: any = null;
  dataLoad: boolean = false;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.dataLoad = true;
    this.getAllSignatureEmployees();
    this.dataLoad = false;
    this.getAllSignatureLetterType();
    this.getAllActiveEmployees();
    this.intializeForm();
  }

  intializeForm() {
    this.AddForm = this.fb.group({
      letterType: ['', Validators.required],
      employee: ['', Validators.required],
    });

    this.UpdateForm = this.fb.group({
      updateLetterType: ['', Validators.required],
      updateEmployee: ['', Validators.required],
    });
  }

  getAllSignatureLetterType() {
    this.subscription = this.http
      .getAllSignatureEmployeesData(
        'entityAttributeValues?entity=SignatureAuthority'
      )
      .subscribe({
        next: (data: any) => {
          this.signatureLetterTypes = data as ISignatureAuthority[];
          console.log(this.signatureLetterTypes);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getAllActiveEmployees() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          this.employeeiddetails = data as IemployeeDetails[];
          this.employeeiddetails = this.employeeiddetails.map(
            (emp: IemployeeDetails) => ({
              ...emp,
              fullName: `${emp.fusionEmpId ?? ''} - ${emp.firstName ?? ''} ${
                emp.middleName ?? ''
              } ${emp.lastName ?? ''}`, // Concatenate firstName, middleName, lastName
            })
          );
          console.log(this.employeeiddetails);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getAllSignatureEmployees() {
    this.subscription = this.http
      .getAllSignatureEmployeesData('SignaturesList')
      .subscribe({
        next: (data: any) => {
          this.signatureEmployeesList = data;
          console.log(this.signatureEmployeesList);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  createSignatureAuthorityFromForm() {
    if (this.AddForm.invalid) {
      this.AddForm.markAllAsTouched();
      return;
    }

    const { letterType, employee } = this.AddForm.value;

    const selectedType = this.signatureLetterTypes.find(
      (type: ISignatureAuthority) => type.id === +letterType
    );

    if (!selectedType) {
      console.error('Invalid letter type selected.');
      return;
    }

    const payload: ISignatureList = {
      authorizedSignatureEmployeeId: employee,
      isdeleted: false,
      letterType: selectedType.value,
    };

    this.subscription = this.http
      .employeeSignatureAuthority('SignaturesList', [payload])
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.getAllSignatureEmployees();
          this.conformationPopup.openSuccessModal(
            'Signature Authority added successfully'
          );
          this.AddForm.reset();
        },
        error: (error: any) => {
          this.modalService.dismissAll();
          const errorMessage = error?.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
          this.AddForm.reset();
        },
      });
  }

  openupdateDialog(item: any) {
    this.selectedId = item.id;

    const matchedLetter = this.signatureLetterTypes.find(
      (type) => type.value === item.letterType
    );
    const matchedEmployee = this.employeeiddetails.find(
      (emp) => emp.employeeId === item.employeeId
    );

    this.UpdateForm.patchValue({
      updateLetterType: matchedLetter?.id || '', // form expects ID
      updateEmployee: matchedEmployee?.employeeId || '',
    });

    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true,
    });
  }


  updateSignatureAuthority(modalRef: any) {
    if (this.UpdateForm.invalid) {
      this.UpdateForm.markAllAsTouched();
      return;
    }
  
    const { updateLetterType, updateEmployee } = this.UpdateForm.value;
    const selectedType = this.signatureLetterTypes.find(type => type.id === +updateLetterType);
  
    if (!selectedType) {
      this.conformationPopup.openErrorModal('Invalid letter type');
      return;
    }
  
    const payload = {
      id: this.selectedId,
      authorizedSignatureEmployeeId: updateEmployee,
      isdeleted: false,
      letterType: selectedType.value
    };
  
    this.subscription = this.http
      .employeeSignatureAuthority('SignaturesList/update', payload)
      .subscribe({
        next: () => {
          modalRef.dismiss();
          this.UpdateForm.reset();
          this.getAllSignatureEmployees();
          this.conformationPopup.openSuccessModal(
            'Signature Authority updated successfully'
          );
        },
        error: (error: any) => {
          modalRef.dismiss();
          const errorMessage = error.error?.message
          this.conformationPopup.openErrorModal(errorMessage);
          this.UpdateForm.reset();
        }
      });
  }

  opendelete(servingPeriodList: any) {
    this.selectedDeleteserving = servingPeriodList;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  deleteSignatureAuthority(modal: any) {
    if (!this.selectedDeleteserving?.id) return;
  
    this.subscription = this.http
      .deleteSignatureEmployee(`SignaturesList/delete/${this.selectedDeleteserving.id}`)
      .subscribe({
        next: () => {
          this.getAllSignatureEmployees();
          modal.dismiss();
          this.signatureEmployeesList = [];
          this.conformationPopup.openSuccessModal('Signature Authority deleted successfully');
        },
        error: () => {
          modal.dismiss();
          this.signatureEmployeesList = [];
          this.conformationPopup.openErrorModal('Failed to delete Signature Authority');
        },
      });
  }

  closeDelete(modal: any) {
    modal.dismiss();
  };

  resetForm() {
    this.AddForm.reset();
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
