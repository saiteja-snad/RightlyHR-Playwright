import { Component, OnDestroy, OnInit } from '@angular/core';
import { ILetters } from './letter-acknowledgement.model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-letter-acknowledgement',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, Select],
  templateUrl: './letter-acknowledgement.component.html',
  styleUrl: './letter-acknowledgement.component.scss'
})
export class LetterAcknowledgementComponent implements OnInit, OnDestroy {
  lettersAcknowledgementList: ILetters[] = [];
  subscription!: Subscription;
  getid: any;
  signatureLetterTypes: any[] = [];
  selectedSignatureType: any;
  letterAckForm!: FormGroup;

  acknowledgementOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  selectedLetter: ILetters = {
    id: 0,
    documentName: '',
    documentType: '',
    isAcknowledgementRequired: false,
    updatedBy: '',
    updatedAt: ''
  };

  constructor(private http: HttpService,
    private modalService: NgbModal,
    private confirmation: OpenModalService,
    public rbac: RbacService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.intialiseForm();
    this.getAllLettersAcknowledgement();
    this.getid = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  }

  intialiseForm() {
    this.letterAckForm = this.fb.group({
      letterName: [{ value: '', disable: true }],
      acknowledge: ['', Validators.required]
    })
  }

  getAllLettersAcknowledgement() {
    this.subscription = this.http.getData('LetterAcknowledgment/getall').subscribe({
      next: (data: any) => {
        this.lettersAcknowledgementList = data;
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }

  openUpdateModal(modal: any, item: ILetters) {
    this.selectedLetter = {
      ...item
    };
    this.patchForm(this.selectedLetter);
    this.modalService.open(modal, { centered: true });
  }

  patchForm(selectedLetter: ILetters) {
    const ack = this.lettersAcknowledgementList.find(item => item.id === selectedLetter.id);
    this.letterAckForm.patchValue({
      letterName: ack?.documentName,
      acknowledge: selectedLetter.isAcknowledgementRequired
    })
    this.letterAckForm.get('letterName')?.disable();
  }

  createLetterAcknowledgement() {
    if (this.selectedSignatureType) {
      const selectedType = this.signatureLetterTypes.find(
        (type: any) => type.id === +this.selectedSignatureType
      );

      if (!selectedType) {
        console.error('Invalid letter type selected.');
        return;
      }

      const payload = {
        documentName: selectedType.value,
        documentType: selectedType.documentType || '',
        isAcknowledgementRequired: false,
        updatedBy: this.getid.employeeId,
        updatedAt: new Date()
      };

      this.subscription = this.http
        .postdata('LetterAcknowledgment', payload)
        .subscribe({
          next: () => {
            this.modalService.dismissAll();
            this.getAllLettersAcknowledgement();
            this.confirmation.openSuccessModal('Data added successfully');
          },
          error: (error: any) => {
            console.log(error);
            this.modalService.dismissAll();
            const errorMessage = error?.error?.message
            this.confirmation.openErrorModal(errorMessage);
          }
        });
    } else {
      console.error('Please provide letter type and select an employee.');
    }
  }

  submitLetterUpdate(form: FormGroup) {
    const payload = {
      id: this.selectedLetter.id,
      documentName: this.selectedLetter.documentName,
      documentType: this.selectedLetter.documentType || '',
      isAcknowledgementRequired: form.value.acknowledge,
      updatedBy: this.getid.employeeId,
      updatedAt: new Date()
    };

    this.http.putData(`LetterAcknowledgment/${payload.id}`, payload).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.getAllLettersAcknowledgement();
        this.confirmation.openSuccessModal('Acknowledgement status updated successfully');
      },
      error: (error: any) => {
        console.log(error);
        this.modalService.dismissAll();
        const errorMessage = error?.error?.message
        this.confirmation.openErrorModal(errorMessage);
      },
      complete: ()=>{
        this.letterAckForm.reset();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
