import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, takeUntil } from 'rxjs';
import { FormValidationsService } from '../../../../../../services/form-validations.service';
import { HttpService } from '../../../../../../services/http.service';
import { OpenModalService } from '../../../../../../services/open-modal.service';
import { ILocation, ISubLocation, IShiftHeader } from '../../../../flexible-leave-allocation/leave-allocation.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-intial-load-entitlement-create',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Select],
  templateUrl: './intial-load-entitlement-create.component.html',
  styleUrl: './intial-load-entitlement-create.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class IntialLoadEntitlementCreateComponent implements OnInit, OnDestroy {
  empinfo: any = {};
  leaveAllocationForm!: FormGroup;
  carryforwarddata: any = {};
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  isCheckingDuplicateJob = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    public formValidations: FormValidationsService,
    private modalService: NgbModal,
    private route: Router,
    private http: HttpService,
    private conformationPopup: OpenModalService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('intialloadEntitlement') ?? '{}');
    this.yearsList = this.getYears();
    this.leaveAllocationForm = this.fb.group({
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
    });
    this.getAllLocations();
    this.setupDuplicateJobValidation();

    if (this.carryforwarddata && Object.keys(this.carryforwarddata).length > 0) {
      this.leaveAllocationForm.enable();
      this.leaveAllocationForm.patchValue({
        year: this.carryforwarddata.year,
        location: this.carryforwarddata.location,
      });
    }
  }

  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    const yearsList: number[] = [];
    for (let i = 0; i < 2; i++) yearsList.push(currentYear + i);
    return yearsList;
  }

  private clearBreakdownCache(): void {
    const raw = localStorage.getItem('intialloadEntitlement');
    const stored = raw ? JSON.parse(raw) : {};
    delete stored.originalBreakdownData;
    delete stored.breakdownData;
    localStorage.setItem('intialloadEntitlement', JSON.stringify(stored));
    this.carryforwarddata = stored;
  }

  enableLocation(): void {
    if (this.leaveAllocationForm.get('year')?.value) {
      this.leaveAllocationForm.get('location')?.reset();
      this.leaveAllocationForm.get('subLocation')?.reset();
      this.leaveAllocationForm.get('shift')?.reset();
      this.clearShiftError('duplicateJob');
      this.leaveAllocationForm.get('location')?.enable();
      this.leaveAllocationForm.get('subLocation')?.disable();
      this.leaveAllocationForm.get('shift')?.disable();
      this.shiftDetails = [];
      this.subLocationDetails = [];
      this.clearBreakdownCache();
    }
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.locationDetails = res.jobLocations || [];
        if (this.carryforwarddata?.location?.jobLocationName) {
          const selectedLocation = this.locationDetails.find(
            (loc: any) => loc.jobLocationName === this.carryforwarddata.location.jobLocationName
          );
          if (selectedLocation) {
            this.onLocationChange(selectedLocation);
            this.leaveAllocationForm.patchValue({ location: selectedLocation });
          }
        }
      },
      error: err => console.error('Error fetching locations:', err)
    });
  }

  onLocationChange(location: ILocation): void {
    this.subLocationDetails = location?.jobSubLocations?.length ? location.jobSubLocations : [];
    this.leaveAllocationForm.get('subLocation')?.enable();
    this.leaveAllocationForm.get('subLocation')?.reset();
    this.leaveAllocationForm.get('shift')?.reset();
    this.clearShiftError('duplicateJob');
    this.leaveAllocationForm.get('shift')?.disable();
    this.shiftDetails = [];
    this.clearBreakdownCache();

    if (this.carryforwarddata?.subLocation) {
      const selectedSub = this.subLocationDetails.find(
        (item: any) => item.jobSubLocationName === this.carryforwarddata.subLocation.jobSubLocationName
      );
      if (selectedSub) {
        this.leaveAllocationForm.patchValue({ subLocation: selectedSub });
        this.getAllShifts(selectedSub);
      }
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    this.shiftDetails = [];
    const params = { locationId: subLocation.jobLocationId, subLocationId: subLocation.id };
    this.http.getDataWithQueryParams('orgShifts/getshiftlocation', params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.shiftDetails = res.flatMap((header: any) => header.orgShiftsItems || []);
        this.leaveAllocationForm.get('shift')?.enable();
        this.leaveAllocationForm.get('shift')?.reset();
        this.clearShiftError('duplicateJob');
        this.clearBreakdownCache();
        if (this.carryforwarddata?.shift) {
          const selectedShift = this.shiftDetails.find((sh: any) => sh.shiftName === this.carryforwarddata.shift.shiftName);
          if (selectedShift) {
            this.leaveAllocationForm.patchValue({ shift: selectedShift });
          }
        }
      },
      error: err => {
        console.error('Error fetching shifts:', err);
        this.shiftDetails = [];
        this.leaveAllocationForm.get('shift')?.reset();
        this.clearShiftError('duplicateJob');
        this.leaveAllocationForm.get('shift')?.disable();
      }
    });
  }

  private setupDuplicateJobValidation(): void {
    const shiftControl = this.leaveAllocationForm.get('shift');
    if (!shiftControl) return;

    shiftControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged((a: any, b: any) => (a?.id ?? a) === (b?.id ?? b)),
        switchMap((shift: any) => {
          this.clearShiftError('duplicateJob');
          if (!shift?.id) return of({ found: false });

          const formValue = this.leaveAllocationForm.getRawValue();
          const yearValue = formValue?.year?.year ?? formValue?.year;
          const locationId = formValue?.location?.id;
          const subLocationId = formValue?.subLocation?.id;
          if (!yearValue || !locationId || !subLocationId) return of({ found: false });

          const params: any = {
            pageNumber: 1,
            pageSize: 1,
            jobType: 'Initial Load',
            shiftIds: shift.id,
            years: yearValue,
            locationIds: locationId,
            subLocationIds: subLocationId,
          };

          const query = new URLSearchParams(params).toString();
          this.isCheckingDuplicateJob = true;
          return this.http.get(`LeaveEntitlementJobs?${query}`).pipe(
            map((res: any) => {
              const total = Number(res?.pagination?.totalRecords ?? 0);
              const listLen = Array.isArray(res?.data) ? res.data.length : 0;
              return { found: (total > 0) || (total === 0 && listLen > 0) };
            }),
            catchError(() => of({ found: false, apiError: true })),
            finalize(() => (this.isCheckingDuplicateJob = false))
          );
        })
      )
      .subscribe((result: any) => {
        if (result?.found === true) {
          this.setShiftError('duplicateJob');
        }
      });
  }

  private setShiftError(key: string): void {
    const ctrl = this.leaveAllocationForm.get('shift');
    if (!ctrl) return;
    const errors = ctrl.errors ?? {};
    if (errors[key]) return;
    ctrl.setErrors({ ...errors, [key]: true });
    ctrl.markAsTouched();
  }

  private clearShiftError(key: string): void {
    const ctrl = this.leaveAllocationForm.get('shift');
    if (!ctrl?.errors) return;
    const errors = { ...ctrl.errors };
    delete errors[key];
    ctrl.setErrors(Object.keys(errors).length ? errors : null);
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  sumbitdata() {
    const formValue = this.leaveAllocationForm.getRawValue();
    const existing = JSON.parse(localStorage.getItem('intialloadEntitlement') ?? '{}');
    const prevShiftId = existing?.shift?.id;
    const newShiftId = formValue.shift?.id;
    const scopeChanged = existing?.year !== formValue.year
      || existing?.location?.id !== formValue.location?.id
      || existing?.subLocation?.id !== formValue.subLocation?.id
      || prevShiftId !== newShiftId;

    const payload: any = {
      year: formValue.year,
      location: formValue.location,
      subLocation: formValue.subLocation,
      shift: formValue.shift,
    };
    // preserve breakdown cache only if scope unchanged
    if (!scopeChanged) {
      payload.originalBreakdownData = existing.originalBreakdownData;
      payload.breakdownData = existing.breakdownData;
    }
    localStorage.setItem('intialloadEntitlement', JSON.stringify(payload));
    this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-breakdown']);
  }

  resetdata() {
    this.leaveAllocationForm.reset();
    this.modalService.dismissAll();
    localStorage.removeItem('intialloadEntitlement');
    this.route.navigate(['/settings/timeoff-configurations/load-entitlement/initial-load-entitlements']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
