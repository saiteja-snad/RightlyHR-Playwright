import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';

@Component({
  selector: 'app-expenses-allowed-days',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './expenses-allowed-days.component.html',
  styleUrl: './expenses-allowed-days.component.scss'
})
export class ExpensesAllowedDaysComponent {
  dateconfigurationForm!: FormGroup;
  subscription!:Subscription
  attribute!: string;
  id!: number;
  value: any;
  constructor( private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService,
    private http: HttpService) { }
    ngOnInit(): void {
     this.dateconfigurtionintialdata()
     this.getdatabyentriy()
    }


  dateconfigurtionintialdata() {
    this.dateconfigurationForm = this.fb.group({
      attribute: [this.attribute],
      value: [this.value, [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(3)]]
    })
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  resetform() {
    this.dateconfigurationForm.reset()
    this.dateconfigurationForm.patchValue({
      attribute: this.attribute,
      value: this.value,
    });

  }

  getdatabyentriy() {

    const params = 'Expense'
    const param = 'pastDatesAllowed'
    this.subscription = this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          const pastDatesAllowed = data.find((item: any) => item.attribute === 'pastDatesAllowed');

          if (pastDatesAllowed) {
            this.attribute = `${pastDatesAllowed.attribute}`;
            this.value = `${pastDatesAllowed.value}`
            this.id = pastDatesAllowed.id
            console.log(`Attribute: ${pastDatesAllowed.attribute}`);
            console.log(`Value: ${pastDatesAllowed.value}`);
            this.dateconfigurationForm.patchValue({
              attribute: this.attribute,
              value: this.value,
            });
          } else {
            console.log('Attribute "pastDatesAllowed" not found.');
          }
          console.log(data)
        }, error(err) {
          console.log("errors", err)
        },
      });
  }
  validateNumberInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Stops non-numeric input
    }
  }

  updatedate(formdata: FormGroup) {
    if (formdata.valid) {
      const payload: any = {
        id: this.id,
        value: formdata.value.value,
      };

      console.log(payload);

      this.subscription = this.http
        .postdata(`entityAttributeValues/update`, payload)
        .subscribe({
          next: (data: any) => {
            console.log(data)
            if (data) {
              this.conformationPopup.openSuccessModal('Data updated successfully')
              
              this.getdatabyentriy();
              formdata.reset()
            }
          },
          error: (err) => {
            console.log('Update failed', err);
          },
        });
    } else {
      console.log('Form is invalid');
    }
  }
}
