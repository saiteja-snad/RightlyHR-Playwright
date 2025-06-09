import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { BusinessData } from './bussiness.model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";

@Component({
  selector: 'app-bussinesarea',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent],
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
  loader = false;
  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    public formValidations : FormValidationsService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.BussinesForm = this.fb.group({
      BUSINESS: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]]
    });
    this.updateForm = this.fb.group({
      BUSINESS: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]]
    });

    this.getBusiness();
  }

  getBusiness() {
    this.loader = true;
    this.http.getData('Bussinesarea').subscribe((data: any) => {
      this.BussinesDetail = data;
      this.loader = false;
    }, (error: any) => {      

      this.loader = false;
  
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
        this.conformationPopup.openSuccessModal('Bussiness Area added successfully');
         this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
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
          this.conformationPopup.openSuccessModal('Bussiness Area updated successfully');
        },
        error: (err: any) => {
          const errorMessage = err.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
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
    this.BussinesForm.reset();
    this.updateForm.patchValue({ BUSINESS: bussinessdetails.areaName });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
// DELETE
  opendelete(bussinessdetails: any) {
    this.selectedDeletebus = bussinessdetails;
    this.BussinesForm.reset();
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
        this.conformationPopup.openSuccessModal('Business Area deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
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
