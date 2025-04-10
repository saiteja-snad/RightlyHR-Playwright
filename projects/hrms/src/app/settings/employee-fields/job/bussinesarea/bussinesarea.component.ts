import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { BusinessData } from './bussiness.model';

@Component({
  selector: 'app-bussinesarea',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './bussinesarea.component.html',
  styleUrl: './bussinesarea.component.scss'
})
export class BussinesareaComponent implements OnInit,OnDestroy{

  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  BussinesForm!: FormGroup;
  updateForm!: FormGroup;
  BussinesDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeletebus: any = null;
  subscription!: Subscription;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.BussinesForm = this.fb.group({
      BUSINESS: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      BUSINESS: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getBusiness();
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
  getBusiness() {
    this.http.getData('Bussinesarea').subscribe((data: any) => {
      this.BussinesDetail = data;
    });
  }
  //ADD
  addBusiness() {
    const request: BusinessData = {
      areaName: this.BussinesForm.value.BUSINESS.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Bussinesarea', request).subscribe({
      next: () => {
        this.getBusiness();
        this.conformationPopup.openSuccessModal('BussinessName added successfully');
         this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
         this.resetForm();
      }
    });
  }
  // UPDATE
  updateBusiness(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: BusinessData = {
        areaName: this.updateForm.value.BUSINESS.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata('Bussinesarea/UPDATER', request).subscribe({
        next: () => {
          this.getBusiness();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Bussiness Name updated successfully');
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
  openupdate(bussinessdetails: any) {
    this.selectedId = bussinessdetails.sno;
    this.updateForm.patchValue({ BUSINESS: bussinessdetails.areaName });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
// DELETE
  opendelete(bussinessdetails: any) {
    this.selectedDeletebus = bussinessdetails;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeletebus) return;

    const deleteRequest: BusinessData = {
      areaName: this.selectedDeletebus.areaName,
      isdeleted: "void",
      sno: this.selectedDeletebus.sno
    };

    this.http.postdata('Bussinesarea/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getBusiness();
        modal.close();
        this.conformationPopup.openSuccessModal('Business Name deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the location');
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeletebus = null;
  }

  resetForm() {
    this.BussinesForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
