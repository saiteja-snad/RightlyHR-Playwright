import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

interface LetterRow {
  type: string;
  required: boolean;
}


@Component({
  selector: 'app-letter-type',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ToggleSwitchModule],
  templateUrl: './letter-type.component.html',
  styleUrl: './letter-type.component.scss'
})
export class LetterTypeComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  subscription!: Subscription;
  loading = false;
  readonly letters: LetterRow[] = [
    { type: 'MSA', required: false },
    { type: 'NDA', required: false }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService) { }


  ngOnInit(): void {
    this.initialiseForm();
    this.getEAV();
  }

  getEAV() {
    this.loading = true;
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Letters')
      .subscribe({
        next: (data: any) => {
          this.loading = false;

          // 1 Collect all values (single or comma-separated) into a Set
          const selected = new Set<string>();

          data.forEach((row: any) => {
            if (!row?.value) return;
            // Split by comma and trim spaces, push each distinct letter
            row.value.split(',')
              .map((v: string) => v.trim())
              .filter(Boolean)
              .forEach((v: string) => selected.add(v));
          });

          // 2 Update base letters array with required = true/false
          this.letters.forEach(letter => {
            letter.required = selected.has(letter.type);
          });

          // 3️ Re-initialize form with updated states
          this.initialiseForm();
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Failed to load letters', error);
        },
        complete: () => this.loading = false
      });
  }

  initialiseForm() {
    this.form = this.fb.group({
      letters: this.fb.array(
        this.letters.map(l =>
          this.fb.group({
            type: [l.type],
            required: [l.required]
          })
        )
      )
    });

    this.form.valueChanges.subscribe(() => this.checkDirty());
  }

  get lettersArray() {
    return this.form.get('letters') as FormArray;
  }

  showUpdate = false;
  private checkDirty() {
    const current = this.form.value.letters;
    this.showUpdate = current.some(
      (row: LetterRow, i: number) => row.required !== this.letters[i].required
    );
  }

  /** Called whenever a toggle is clicked */
  onClickedAck(event: any, index: number) {
    console.log('Toggle event for index', index, '=>', event.checked);
  }

  onUpdate() {
    if (this.form.invalid) return;

    //  Always take the current required state of ALL letters
    //    (not just the ones flipped in this session)
    const selectedLetters = this.lettersArray.value
      .filter((row: any) => row.required)   // all currently ON
      .map((row: any) => row.type.trim());

    const joinedLetters = selectedLetters.join(',');

    const payload = {
      entity: 'Project',
      attribute: 'Letters',
      value: joinedLetters,   // <-- includes previously saved ON letters + new ones
      meta: ''
    };

    this.subscription = this.http.postdata('entityAttributeValues', payload).subscribe({
      next: () => {
        this.conformationPopup.openSuccessModal('Letter configuration  updated successfully');

        //  Sync our local array to the latest ON states
        const current = this.lettersArray.value;
        this.letters.forEach((l, i) => (l.required = current[i].required));

        this.initialiseForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(
          error?.error?.message || 'Failed to update Letter Type'
        );
      },
      complete: () => {
        this.showUpdate = false;
        this.getEAV();   // refresh from server if needed
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
