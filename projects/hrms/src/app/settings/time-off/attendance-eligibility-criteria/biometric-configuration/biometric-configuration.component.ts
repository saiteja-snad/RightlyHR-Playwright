import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-biometric-configuration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './biometric-configuration.component.html',
  styleUrl: './biometric-configuration.component.scss'
})
export class BiometricConfigurationComponent implements OnInit {

  form!: FormGroup;

  isLoading = false;
  showUpdate = false;
  eavId: number = 0;

  // Value currently stored in DB
  originalValue = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private openModalService: OpenModalService,
    public rbac: RbacService
  ) { }

  ngOnInit(): void {
    this.initialiseForm();
    this.getBiometricConfiguration();
  }

  initialiseForm(): void {
    this.form = this.fb.group({
      isProcessing: [this.originalValue]
    });

    this.form.get('isProcessing')?.valueChanges.subscribe((value: boolean) => {
      this.showUpdate = value !== this.originalValue;
    });
  }

  getBiometricConfiguration(): void {
    this.isLoading = true;

    this.http
      .getData(
        'entityAttributeValues?entity=AttendanceConfiguration&attribute=IsProcessing'
      )
      .subscribe({
        next: (data: any) => {

          console.log('Biometric EAV response:', data);

          if (data && data.length > 0) {

            this.eavId = data[0].id;

            this.originalValue =
              String(data[0].value).toLowerCase() === 'true';

            this.form.patchValue(
              {
                isProcessing: this.originalValue
              },
              { emitEvent: false }
            );
          }

          console.log('EAV ID:', this.eavId);
          console.log('IsProcessing:', this.originalValue);

          this.showUpdate = false;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error(
            'Failed to load biometric configuration',
            error
          );
        }
      });
  }

  onUpdate(): void {
  if (this.form.invalid) return;

  const value = this.form.get('isProcessing')?.value;

  const payload = {
    id: this.eavId,
    entity: 'AttendanceConfiguration',
    attribute: 'IsProcessing',
    value: String(value),
    meta: ''
  };

  console.log('UPDATE PAYLOAD:', payload);

  this.http
    .postdata('entityAttributeValues/update', payload)
    .subscribe({
      next: () => {
        this.originalValue = value;
        this.showUpdate = false;

        this.openModalService.openSuccessModal(
          'Biometric configuration updated successfully'
        );

        this.getBiometricConfiguration();
      },

      error: (error: any) => {
        console.error('Update error:', error);

        this.openModalService.openErrorModal(
          error?.error?.message ||
          'Failed to update Biometric Configuration'
        );
      }
    });
}
}