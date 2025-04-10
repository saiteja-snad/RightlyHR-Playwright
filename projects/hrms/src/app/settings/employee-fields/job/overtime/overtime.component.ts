import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OvertimeData } from './overtime-model';

@Component({
  selector: 'app-overtime',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './overtime.component.html',
  styleUrl: './overtime.component.scss'
})
export class OvertimeComponent implements OnInit,OnDestroy {

  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  OvertimeForm!: FormGroup;
  updateForm!: FormGroup;
  overtimeDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteovr: any = null;
  subscription!: Subscription;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.OvertimeForm = this.fb.group({
      overtime: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      overtime: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getovertime();
  }
  // alphabet allowed only
  blockNonAlphabets(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);
    const char = String.fromCharCode(event.keyCode);
    // const pattern = /^[a-zA-Z][a-zA-Z ]*$/;
    const pattern = /^[a-zA-Z ]$/;
    const input = (event.target as HTMLInputElement).value;
    // if (!pattern.test(inputChar)) {
    //   event.preventDefault(); // blocks numbers or symbols
    // }
    if (!pattern.test(char) || (char === ' ' && input.length === 0)) {
      event.preventDefault();
    }
  }
  getovertime() {
    this.http.getData('Overtime').subscribe((data: any) => {
      this.overtimeDetail = data;
    });
  }
  //ADD
  AddOvertime() {
    const request: OvertimeData = {
      overtimeeligibility1: this.OvertimeForm.value.overtime.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Overtime', request).subscribe({
      next: () => {
        this.getovertime();
        this.conformationPopup.openSuccessModal('Data added successfully');
         this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
         this.resetForm();
      }
    });
  }
  // UPDATE
    updateovertime(modal: any) {
      if (this.updateForm.valid && this.selectedId) {
        const request: OvertimeData = {
          overtimeeligibility1: this.updateForm.value.overtime.trim(),
          isdeleted: "Active",
          sno: this.selectedId
        };
  
        this.subscription = this.http.postdata('Overtime/UPDATER', request).subscribe({
          next: () => {
            this.getovertime();
            modal.close();
            this.updateForm.reset();
            this.conformationPopup.openSuccessModal('Data updated successfully');
          },
          error: (err: any) => {
            this.conformationPopup.openErrorModal('Update failed. Please try again.');
          }
        });
      }
    }
    close(modal: any) {
      modal.dismiss();
      this.updateForm.reset();
    }
    openupdate(overtimedetails: any) {
      this.selectedId = overtimedetails.sno;
      this.updateForm.patchValue({ overtime: overtimedetails.overtimeeligibility1 });
      this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
    }
    // DELETE
      opendelete(overtimedetails: any) {
        this.selectedDeleteovr = overtimedetails;
        this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
      }
      onDelete(modal: any) {
        if (!this.selectedDeleteovr) return;
    
        const deleteRequest: OvertimeData = {
          overtimeeligibility1: this.selectedDeleteovr.overtimeeligibility1,
          isdeleted: "void",
          sno: this.selectedDeleteovr.sno
        };
    
        this.http.postdata('Overtime/UPDATER', deleteRequest).subscribe({
          next: () => {
            this.getovertime();
            modal.close();
            this.conformationPopup.openSuccessModal('Data deleted successfully');
          },
          error: (err: any) => {
            this.conformationPopup.openErrorModal('Failed to delete the location');
          }
        });
      }
    
      closeDelete(modal: any) {
        modal.dismiss();
        this.selectedDeleteovr = null;
      }
    
      resetForm() {
        this.OvertimeForm.reset();
        this.isEditMode = false;
        this.selectedId = null;
      }
    
      ngOnDestroy(): void {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
      }
}
