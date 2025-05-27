import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { frequenceData } from './frequency-model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
@Component({
  selector: 'app-frequency',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './frequency.component.html',
  styleUrl: './frequency.component.scss'
})
export class FrequencyComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;

  FrequencyForm!: FormGroup;
  updateForm!: FormGroup;
  FrequencyDetail: any[] = [];
  selectedId: number | null = null;
  selectedDeletefreq: any = null;
  subscription!: Subscription;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) { }

  ngOnInit(): void {
    this.FrequencyForm = this.fb.group({
      frequency: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });
    this.updateForm = this.fb.group({
      frequency: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });

    this.getFrequencies();
  }

  getFrequencies() {
    this.subscription = this.http.getData('Frequency').subscribe({
      next: (data: any) => {
        this.FrequencyDetail = data;
      }
    });
  }

  addFrequency() {
    const request: frequenceData = {
      frequency1: this.FrequencyForm.value.frequency.trim(),
      isdeleted: 'Active'
    };

    this.subscription = this.http.postdata('Frequency', request).subscribe({
      next: () => {
        this.getFrequencies();
        this.conformationPopup.openSuccessModal('Frequency added successfully');
        this.resetForm();
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  updateFrequency(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: frequenceData = {
        frequency1: this.updateForm.value.frequency.trim(),
        isdeleted: 'Active',
        sno: this.selectedId
      };

      this.subscription = this.http.postdata('Frequency/UPDATER', request).subscribe({
        next: () => {
          this.getFrequencies();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Frequency updated successfully');
        },
        error: (err:any) => {
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

  openUpdate(freq: any) {
    this.selectedId = freq.sno;
    this.FrequencyForm.reset();
    this.updateForm.patchValue({ frequency: freq.frequency1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  openDelete(freq: any) {
    this.selectedDeletefreq = freq;
    this.FrequencyForm.reset();
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  onDelete(modal: any) {
    if (!this.selectedDeletefreq) return;

    const deleteRequest: frequenceData = {
      frequency1: this.selectedDeletefreq.frequency1,
      isdeleted: 'void',
      sno: this.selectedDeletefreq.sno
    };

    this.http.postdata('Frequency/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getFrequencies();
        modal.close();
        this.conformationPopup.openSuccessModal('Frequency deleted successfully');
      },
      error: (err:any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeletefreq = null;
  }

  resetForm() {
    this.FrequencyForm.reset();
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
