import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { AuthService } from '../../../../services/auth.service';
import moment from 'moment';
import { ConfirmationIconComponent } from "../../../../icons/confirmation-icon/confirmation-icon.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-task-type',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DataLoaderContentComponent, ConfirmationIconComponent, NoDataFoundComponent],
  templateUrl: './task-type.component.html',
  styleUrl: './task-type.component.scss'
})
export class TaskTypeComponent implements OnInit, OnDestroy{
subscription!: Subscription;
  addForm!: FormGroup;
  updateForm!: FormGroup;
  tastType: any[] = [];
  loading = false;
  selecteddata!: any;
  selectedstatus:any;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('Confirmation') Confirmation: any;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,private auth:AuthService) { }

  ngOnInit(): void {
    this.initialiseForm();
    this.getTaskType();
  }

initialiseForm() {
  this.addForm = this.fb.group({
    taskType: [null, [
      Validators.required,
      this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(51),
      Validators.pattern(/^[^\s].*$/)
    ]],
    color: ['']
  });

  this.updateForm = this.fb.group({
    taskType: [null, [
      Validators.required,
      this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(51),
      Validators.pattern(/^[^\s].*$/)
    ]],
    updatecolor: ['']
  });
}


getTaskType() {
  this.loading = true;
  this.subscription = this.http.getData('TaskType').subscribe({
    next: (res: any) => {
      this.loading = false;
      this.tastType =res
    },
    error: () => (this.loading = false),
    complete: () => (this.loading = false)
  });
}


onAddSubmit(modal: any) {
  let loggedinuser=this.auth.getToken();
  if (this.addForm.valid) {
    const formValue = this.addForm.value;
    let payload = {
      taskTypeName: formValue.taskType,
      status: 'Active',
      createdBy: loggedinuser.employeeId,
      createdAt: moment().format('YYYY-MM-DD'),
      color: formValue.color ||'#000000'
     }
    this.http.postdata('TaskType',payload).subscribe({
      next: () => {
        this.conformationPopup.openSuccessModal('Task Type added successfully');
        modal.close();
        this.addForm.reset();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to add data');
      },
      complete: () => this.getTaskType()
    });
  }
}


  close(): void {
    this.modalService.dismissAll();
    this.updateForm.reset();
  }

  closed(modal: any) {
    modal.close();
    this.addForm.reset();
  }

  openupdateDialog(taskType: any) {
    // this.selectedId = jobrole.id;
    this.selecteddata = taskType;
    this.updateForm.patchValue({
      taskType: taskType.taskTypeName,
      updatecolor: taskType.color
    });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  opendeleted(taskType: any,status?:any) {
    this.selectedstatus=status;
    this.selecteddata = taskType;
    this.modalService.open(this.Confirmation, { backdrop: 'static', centered: true });
  }

  updatetaskTypeType(form: FormGroup): void {
    let loggedinuser=this.auth.getToken();
    if (form.valid && this.selecteddata) {
      let payload = {
        id: this.selecteddata.id,
      taskTypeName: form.value.taskType,
      status: 'Active',
      createdBy: loggedinuser.employeeId,
      createdAt: moment().format('YYYY-MM-DD'),
      color: form.value.updatecolor ||'#000000'
     }
    this.http.postdata('TaskType/UPDATER',payload).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Task Type updated successfully');
        this.updateForm.reset();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to update data');
      },
      complete: () => this.getTaskType()
    });
    }
  }

 deletetaskTypeType(): void {
  if (this.selecteddata && this.selectedstatus) {

    const payload = {
      id: this.selecteddata.id,
      status: this.selectedstatus // 'Active' or 'Inactive'
    };

    this.subscription = this.http.postdata(`TaskType/UPDATER`, payload)
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          const message = this.selectedstatus === 'Inactive'
            ? 'Task Type inactivated successfully'
            : 'Task Type activated successfully';

          this.conformationPopup.openSuccessModal(message);
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(
            error?.error?.Message || 'Failed to update task Type status'
          );
        },
        complete: () => {
          this.getTaskType();
          this.selecteddata = {} as any;
          this.selectedstatus = '';
        }
      });
  }
}

  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
