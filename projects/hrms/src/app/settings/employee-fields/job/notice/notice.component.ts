import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { NoticeData } from './notice-module';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";

@Component({
  selector: 'app-notice',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent],
  templateUrl: './notice.component.html',
  styleUrl: './notice.component.scss'
})
export class NoticeComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  noticeperiodForm!: FormGroup;
  updateForm!: FormGroup;
  noticeperiodDetail: any[] = [];
  loader = false;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteDep: any = null;
  subscription!: Subscription;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {}

  ngOnInit(): void {
    this.noticeperiodForm = this.fb.group({
      noticeperiod: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]]
    });
    this.updateForm = this.fb.group({
      updatenoticeperiod:  ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]]

    });
    this.getNoticeperiod();
  }

  getNoticeperiod() {
    this.loader = true;
    this.subscription = this.http.getData('Noticeperiod').subscribe({
      next: (data: any) => {
        this.noticeperiodDetail = data;
        this.loader = false;
      },
      error: (error: any) => {
        this.loader = false;
     
      }
    });
  }

  addNoticeperiod() {
    const request: NoticeData = {
      period: this.noticeperiodForm.value.noticeperiod.trim(),
      isdeleted: 'Active'
    };

    this.subscription = this.http.postdata('Noticeperiod', request).subscribe({
      next: () => {
        this.getNoticeperiod();
        this.conformationPopup.openSuccessModal('Notice Period added successfully');
        this.resetForm();
      },
      error: (err : any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }
  openupdate(noticePeriodList: any) {
    this.selectedId = noticePeriodList.id;
    this.noticeperiodForm.reset();
    this.updateForm.patchValue({ updatenoticeperiod: noticePeriodList.period });
  
    // Mark control as touched and update validity
    this.updateForm.get('updatenoticeperiod')?.markAsTouched();
    this.updateForm.get('updatenoticeperiod')?.markAsDirty();
    this.updateForm.get('updatenoticeperiod')?.updateValueAndValidity();
  
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  
  updateNoticeperiod(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: NoticeData = {
        period: this.updateForm.value.updatenoticeperiod.trim(),
        isdeleted: 'Active',
        id: this.selectedId
      };

      this.subscription = this.http.postdata('Noticeperiod/UPDATER', request).subscribe({
        next: () => {
          this.getNoticeperiod();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Notice Period updated successfully');
        },
        error: (err: any) => {
          const errorMessage = err.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  }


  openDelete(item: any) {
    this.selectedDeleteDep = item;
    this.noticeperiodForm.reset();
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  onDelete(modal: any) {
    if (!this.selectedDeleteDep) return;

    const deleteRequest: NoticeData = {
      period: this.selectedDeleteDep.period,
      isdeleted: 'void',
      id: this.selectedDeleteDep.id
    };

    this.http.postdata('Noticeperiod/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getNoticeperiod();
        modal.close();
        this.conformationPopup.openSuccessModal('Notice Period deleted successfully');
      },
      error: (err:any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  close(modal: any) {
    modal.dismiss();
    this.updateForm.reset();
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteDep = null;
  }

  resetForm() {
    this.noticeperiodForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
