import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InterviewRoundData } from './interview-module';

@Component({
  selector: 'app-interview-round',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './interview-round.component.html',
  styleUrl: './interview-round.component.scss'
})
export class InterviewRoundComponent implements OnInit {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  updateinterviewdetails = {} as any;
  selectedDeleteinterview = {} as any;
  subscription!: Subscription;
  interviewlist= [] as any[];
  interviewtypelist=[] as any[]
  roundname1= [] as any[];
  selectedId: number | null = null;
  interviewdetails=[] as any[];
  
  selectedDeleteBank = {} as any;

  // salDeletedata: any;
  constructor(
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    private fb: FormBuilder,
    public formValidations: FormValidationsService,
     public rbac: RbacService,
  ) {}

  interviewForm!: FormGroup;
  updateForm!: FormGroup;

  ngOnInit(): void {
    this.interviewForm = this.fb.group({
      interview: [null, [Validators.required]],
    });
    this.updateForm = this.fb.group({
      roundname1: ['', Validators.required],
    });
    this.getInterview();
  }
  getInterview() {
    this.subscription = this.http.getData('interviewRounds').subscribe({
      next: (data: any) => {
        console.log(data);
        this.interviewdetails = data as InterviewRoundData [];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }
  onSubmit() {
    const request = {
      roundname: this.interviewForm?.get('interview')?.value,
      isdeleted:false,
    };

    console.log('Sending request:', request);

    this.subscription = this.http.postdata('interviewRounds', request).subscribe({
      next: (data: any) => {
        console.log('Response:', data);
        this.modalService.dismissAll();
        this.interviewForm.reset();
        this.getInterview();
        this.conformationPopup.openSuccessModal('interview added successfully');
      },
      error: (reason: any) => {
        console.error('Error:', reason);
        this.conformationPopup.openErrorModal('Failed to add round name data');
      },
    });
  }

  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }

  opendelete(interview: any) {
    console.log(interview);
    this.selectedDeleteinterview = interview;
    this.modalService.open(this.deletepopup, {
      centered: true,
      backdrop: 'static',
    });
    
  
  }
  openupdate(interviewtypelist: any) {
    this.selectedId = interviewtypelist.id;
    this.updateForm.patchValue({ roundname1: interviewtypelist.roundname    });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  
  updateinterview(modal: any) {
    // if (this.updateForm.valid && this.selectedId) {
    //   const request: InterviewRoundData = {
    //     roundname1: this.updateForm.value.roundname1.trim(),
    //     isdeleted: 'false',
    //    id : this.selectedId,
    //   };
 if (this.updateForm.valid && this.selectedId) {
      const request: InterviewRoundData = {
        roundname : this.updateForm.value.roundname1.trim(),
        isdeleted: false,
        id: this.selectedId,
      };
    
      this.subscription = this.http
        .postdata(`interviewRounds/UPDATER/1`, request)
        .subscribe({
          next: () => {
            this.getInterview();
            modal.close();
            this.updateForm.reset();
            this.conformationPopup.openSuccessModal(
              'interview updated successfully'
            );
          },
          error: (err: any) => {
            this.conformationPopup.openErrorModal(
              'Update failed. Please try again.'
            );
          },
        });
    }
  }

  onDeleteinterview(modal: any) {
    if (!this.selectedDeleteinterview) return;

    const deleteRequest = {
      id: this.selectedDeleteinterview.id,
      roundname: this.selectedDeleteinterview.roundname1,
      isdeleted: true,
    };

    this.http.deleteData(`interviewRounds/${this.selectedDeleteinterview.id}`).subscribe({
      next: () => {
        this.getInterview();
        modal.close();
        this.conformationPopup.openSuccessModal('Interview  deleted successfully');
      },
      error: (err: any) => {
        console.error('Delete interview failed:', err);
        this.conformationPopup.openErrorModal('Failed to delete interview data');
      },
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteinterview = null;
  }
}