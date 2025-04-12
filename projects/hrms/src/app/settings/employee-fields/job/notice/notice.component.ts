import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { NoticeData } from './notice-module';

@Component({
  selector: 'app-notice',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './notice.component.html',
  styleUrl: './notice.component.scss'
})
export class NoticeComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  noticeperiodForm!: FormGroup;
  updateForm!: FormGroup;
  noticeperiodDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteDep: any = null;
  subscription!: Subscription;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService
  ) {}

  ngOnInit(): void {
    this.noticeperiodForm = this.fb.group({
      noticeperiod: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      noticeperiod:  ['', Validators.required]

    });
    this.getNoticeperiod();
  }

  blockNonAlphabets(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[a-zA-Z ]$/;
    const input = (event.target as HTMLInputElement).value;
    if (!pattern.test(char) || (char === ' ' && input.length === 0)) {
      event.preventDefault();
    }
  }

  getNoticeperiod() {
    this.subscription = this.http.getData('Noticeperiod').subscribe({
      next: (data: any) => {
        this.noticeperiodDetail = data;
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
      error: () => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
  openupdate(noticePeriodList: any) {
    this.selectedId = noticePeriodList.id;
    this.updateForm.patchValue({ noticeperiod: noticePeriodList.period });
  
    // Mark control as touched and update validity
    this.updateForm.get('noticeperiod')?.markAsTouched();
    this.updateForm.get('noticeperiod')?.markAsDirty();
    this.updateForm.get('noticeperiod')?.updateValueAndValidity();
  
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  
  updateNoticeperiod(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: NoticeData = {
        period: this.updateForm.value.noticeperiod,
        isdeleted: 'Active',
        id: this.selectedId
      };

      this.subscription = this.http.postdata('Noticeperiod/UPDATER', request).subscribe({
        next: () => {
          this.getNoticeperiod();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Notice Period Updated Successfully');
        },
        error: () => {
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
        }
      });
    }
  }


  openDelete(item: any) {
    this.selectedDeleteDep = item;
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
        this.conformationPopup.openSuccessModal('Notice Period Deleted Successfully');
      },
      error: () => {
        this.conformationPopup.openErrorModal('Failed to delete the notice period');
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
