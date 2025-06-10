import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ILocation,
  IShiftHeader,
  ISubLocation,
} from '../../../time-off/flexible-leave-allocation/leave-allocation.model';
import { IJob } from '../../../../Interfaces/letters-model';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { ManageDST } from '../dsts.modal';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';

@Component({
  selector: 'app-update-dst',
  imports: [SelectModule, CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './update-dst.component.html',
  styleUrl: './update-dst.component.scss',
})
export class UpdateDstComponent implements OnInit, OnDestroy {
  dstForm!: FormGroup;
  yearsList: number[] = [];
  empinfo = {} as IJob;
  destroy$ = new Subject<void>();
  locationDetails: ILocation[] = [];
  subLocationDetails: ISubLocation[] = [];
  shiftDetails: IShiftHeader[] = [];
  momentType: string[] = ['Forward', 'Backward'];
  durations: number[] = [1, 1.5, 2, 2.5, 3];
  pendingDST: ManageDST | null = null;
  hidePublishCloneButtons: boolean = false;
  isdisabled = true;
   initialPoliciesState: any;
  @ViewChild('cancelpopup') cancelpopup!: TemplateRef<any>;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.yearsList = this.getYears();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.inititializeForm();

    const localStorageData = localStorage.getItem('pendingDST');
    if (localStorageData) {
      this.pendingDST = JSON.parse(localStorageData);
    }

    if (this.pendingDST) {
      this.dstForm.patchValue({
        year: this.pendingDST.applicableYear,
      });
    }
    this.handleFormValueChanges();

    this.getAllLocations();

     this.momentRows.valueChanges.subscribe(() => {
    const currentState = JSON.stringify(this.momentRows.getRawValue());
    this.hidePublishCloneButtons = currentState === this.initialPoliciesState ? false : true;
  });
  }

  inititializeForm() {
    this.dstForm = this.fb.group({
      year: [ { value: '', disabled: true }, Validators.required],
      location: [{ value: '', disabled: true } , Validators.required],
      subLocation: [ { value: '', disabled: true } , Validators.required],
      shift: [ { value: '', disabled: true } , Validators.required],
      momentRows: this.fb.array([]),
    });

    if (!this.pendingDST?.dayLight?.length) {
      this.addMomentRow(); // add initial row if nothing to populate
    }
  }

  createMomentRow(): FormGroup {
    return this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      momentType: [null, Validators.required],
      duration: [null, Validators.required],
    });
  }

  get momentRows(): FormArray {
    return this.dstForm.get('momentRows') as FormArray;
  }

  addMomentRow() {
    if (this.momentRows.length < 4) {
      this.momentRows.push(this.createMomentRow());
    }
  }
  //min date selected
  getMinDateForHoliday(): string {
    const selectedYear = this.dstForm.get('year')?.value;
    if (selectedYear) {
      return `${selectedYear}-01-01`;
    }
    return moment().format('YYYY-MM-DD'); // fallback
  }
  //max date selected
  getMaxDateForHoliday(): string {
    const selectedYear = this.dstForm.get('year')?.value;
    if (selectedYear) {
      return `${selectedYear}-12-31`;
    }
    return moment().format('YYYY-MM-DD'); // fallback
  }


 //this method used for delete icon click
 removeMomentRow(index: number): void {
  if (this.momentRows.length > 1) {
    this.momentRows.removeAt(index);
  }
}

  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => currentYear - 1 + i);
  }

  onLocationChange(location: ILocation): void {
    this.subLocationDetails = location.jobSubLocations ?? [];
    this.dstForm.get('subLocation')?.enable();
    this.dstForm.get('subLocation')?.reset();
    this.dstForm.get('shift')?.disable();
    this.dstForm.get('subLocation')?.markAsTouched();
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id,
    };
    this.dstForm.get('shift')?.markAsTouched();
    this.http
      .getDataWithQueryParams('orgShifts/getshiftlocation', params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.dstForm.get('shift')?.markAsTouched();
        
          this.shiftDetails = res.flatMap(
            (header: any) => header.orgShiftsItems ?? []
          );
          const matchedShift = this.shiftDetails.find(
            (s) => s.id === this.pendingDST?.shiftId
          );
          this.dstForm.patchValue({ shift: matchedShift ?? null });
           this.initialPoliciesState = JSON.stringify(this.momentRows.getRawValue());
          this.hidePublishCloneButtons = false;
        },
        error: (err) => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.dstForm.get('shift')?.reset();
          this.dstForm.get('shift')?.disable();
        },
      });
  }

  private getAllLocations(): void {
    this.http
      .getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.locationDetails = res.jobLocations || [];
          const selectedLocation = this.locationDetails.find(
            (loc) => loc.id === this.pendingDST?.locationId
          );
          this.subLocationDetails = selectedLocation?.jobSubLocations ?? [];

          const selectedSubLocation = this.subLocationDetails.find(
            (sub) => sub.id === this.pendingDST?.sublocationId
          );

          this.dstForm.patchValue({
            location: selectedLocation ?? null,
            subLocation: selectedSubLocation ?? null,
          });

          if (selectedSubLocation) {
            this.getAllShifts(selectedSubLocation);
          }

          // Patch moment rows
          if (this.pendingDST?.dayLight?.length) {
            this.momentRows.clear();
            this.pendingDST.dayLight.forEach((row) => {
              this.momentRows.push(
                this.fb.group({
                  startDate: this.formatToDateInput(row.startDate),
                  endDate: this.formatToDateInput(row.endDate),
                  momentType: row.momentType,
                  duration: row.duration,
                })
              );
            });
          }
        },
        error: (err) => console.error('Error fetching locations:', err),
      });
  }

  private handleFormValueChanges(): void {
    const form = this.dstForm;

    const resetAndDisable = (controls: string[]) => {
      controls.forEach(control => {
        form.get(control)?.reset();
       // form.get(control)?.disable();
      });
    };

    form.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        form.get('location')?.reset();
        resetAndDisable(['subLocation', 'shift']);
      });

    form.get('location')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['subLocation', 'shift']);
      });

    form.get('subLocation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        form.get('shift')?.reset();
        // resetAndDisable(['shift']);
      });
  }

  openConfirmation(){
    this.modalService.open(this.cancelpopup, {centered: true, backdrop: 'static'})
  }
  closeUpdateDST(){
    this.modalService.dismissAll();
    this.navigate();
   }

  formatToDateInput(dateStr: string): string {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  UpdateDST(dstForm: FormGroup) {
    if (dstForm.valid) {
      const formValue = dstForm.value;
      const holidays = {
        lastModifiedDate: new Date(),
        addedDate: new Date(),
        id: this.pendingDST?.id,
        status: 'Pending for submission',
        addedBy: this.empinfo.employeeId,
        lastModifiedBy: this.empinfo.employeeId,
        applicableYear: this.pendingDST?.applicableYear,
        sublocationId: this.pendingDST?.sublocationId,
        shiftId: this.pendingDST?.shiftId,
        locationId: this.pendingDST?.locationId,
        dayLight: formValue.momentRows.map((row: any) => ({
          startDate: new Date(row.startDate),
          endDate: new Date(row.endDate),
          momentType: row.momentType,
          duration: row.duration,
          headerId: this.pendingDST?.dayLight?.[0]?.headerId,
        })),
      };
      this.http
        .postdata('OrgDayLight/Update/Shift/OrgShift', holidays)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.statusCode === 400) {
              this.sharedModalService.openErrorModal(
                'Error: Shift already exists.'
              );
            }

            this.sharedModalService.openSuccessModal(
              'DST updated successfully'
            );
            this.navigate();
          },
          error: (err) => {
            if (err.error) {
              this.sharedModalService.openErrorModal(
                'Error: ' + err.error.Message
              );
            }
          },
        });
    }
  }

  publishDST() {
    let publishItem = {
      Category: 'Daylightsaving',
      refentityId: this.pendingDST?.dayLight[0].headerId,
    };
    this.http
      .postdata(
        `CompanyRequests/Publish?Category=${publishItem.Category}&refentityId=${publishItem.refentityId}`,
        { params: publishItem }
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respnose: any) => {
          this.sharedModalService.openSuccessModal(
            'DST Published Successfully'
          );
          this.navigate();
        },
        error: (err) => {
          if (err.error) {
            this.sharedModalService.openErrorModal(err.error);
          }
          this.sharedModalService.openErrorModal(
            'Error occured while publishing manage dst'
          );
        },
      });
  }
  navigate(): void {
    this.router.navigate(['/settings/employee-fields/manage-dsts']);
  }

  navigateToCloneComponent(): void {
    localStorage.setItem('cloneDST', JSON.stringify(this.pendingDST));
    this.router.navigate(['/settings/employee-fields/clone-dst']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
