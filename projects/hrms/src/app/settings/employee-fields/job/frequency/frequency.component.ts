import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { frequenceData } from './frequency-model';
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
    private conformationPopup: OpenModalService
  ) { }

  ngOnInit(): void {
    this.FrequencyForm = this.fb.group({
      frequency: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      frequency: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getFrequencies();
  }

  blockNonAlphabets(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.keyCode);
    const pattern = /^[a-zA-Z ]$/;
    const input = (event.target as HTMLInputElement).value;
    if (!pattern.test(char) || (char === ' ' && input.length === 0)) {
      event.preventDefault();
    }
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
      error: () => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }

  updateFrequency(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: frequenceData = {
        frequency1: this.updateForm.value.frequency,
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
        error: () => {
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
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
    this.updateForm.patchValue({ frequency: freq.frequency1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  openDelete(freq: any) {
    this.selectedDeletefreq = freq;
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
      error: () => {
        this.conformationPopup.openErrorModal('Failed to delete the frequency');
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
