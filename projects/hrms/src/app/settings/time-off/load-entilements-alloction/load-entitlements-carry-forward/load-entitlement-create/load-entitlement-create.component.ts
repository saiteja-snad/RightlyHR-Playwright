import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { HttpService } from '../../../../../services/http.service';
import { ILocation, IShiftHeader, ISubLocation } from '../../../flexible-leave-allocation/leave-allocation.model';
@Component({
  selector: 'app-load-entitlement-create',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Select],
  templateUrl: './load-entitlement-create.component.html',
  styleUrl: './load-entitlement-create.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class LoadEntitlementCreateComponent implements OnInit, OnDestroy {
  empinfo: any = {};
  leaveAllocationForm!: FormGroup;
  carryforwarddata: any = {};
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private fb: FormBuilder, private modalService: NgbModal, private route: Router, private http: HttpService) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}');
    this.yearsList = this.getYears();
    this.leaveAllocationForm = this.fb.group({
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
    });
    this.getAllLocations();
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
    const list: number[] = [];
    for (let i = -1; i < 1; i++) list.push(currentYear + i);
    return list;
  }

  enableLocation(): void {
    if (this.leaveAllocationForm.get('year')?.value) {
      this.leaveAllocationForm.get('location')?.reset();
      this.leaveAllocationForm.get('subLocation')?.reset();
      this.leaveAllocationForm.get('shift')?.reset();
      this.leaveAllocationForm.get('location')?.enable();
      this.leaveAllocationForm.get('subLocation')?.disable();
      this.leaveAllocationForm.get('shift')?.disable();
      this.subLocationDetails = [];
      this.shiftDetails = [];
    }
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.locationDetails = res.jobLocations || [];
        if (this.carryforwarddata?.location?.jobLocationName) {
          const loc = this.locationDetails.find((l: any) => l.jobLocationName === this.carryforwarddata.location.jobLocationName);
          if (loc) { this.onLocationChange(loc); this.leaveAllocationForm.patchValue({ location: loc }); }
        }
      },
      error: err => console.error(err)
    });
  }

  onLocationChange(location: ILocation): void {
    this.subLocationDetails = location?.jobSubLocations?.length ? location.jobSubLocations : [];
    this.leaveAllocationForm.get('subLocation')?.enable();
    this.leaveAllocationForm.get('subLocation')?.reset();
    this.leaveAllocationForm.get('shift')?.reset();
    this.leaveAllocationForm.get('shift')?.disable();
    this.shiftDetails = [];

    if (this.carryforwarddata?.subLocation) {
      const sub = this.subLocationDetails.find((s: any) => s.jobSubLocationName === this.carryforwarddata.subLocation.jobSubLocationName);
      if (sub) { this.leaveAllocationForm.patchValue({ subLocation: sub }); this.getAllShifts(sub); }
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    this.shiftDetails = [];
    const params = { locationId: subLocation.jobLocationId, subLocationId: subLocation.id };
    this.http.getDataWithQueryParams('orgShifts/getshiftlocation', params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.shiftDetails = res.flatMap((h: any) => h.orgShiftsItems || []);
        this.leaveAllocationForm.get('shift')?.enable();

        if (this.carryforwarddata?.shift) {
          const sh = this.shiftDetails.find((s: any) => s.shiftName === this.carryforwarddata.shift.shiftName);
          if (sh) { this.leaveAllocationForm.patchValue({ shift: sh }); return; }
        }
        this.leaveAllocationForm.get('shift')?.reset();
      },
      error: err => console.error(err)
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  sumbitdata() {
    const formValue = this.leaveAllocationForm.getRawValue();
    const existing = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}');
    const payload = {
      ...existing,
      year: formValue.year,
      location: formValue.location,
      subLocation: formValue.subLocation,
      shift: formValue.shift,
    };
    localStorage.setItem('loadEntitlement', JSON.stringify(payload));
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-map-categoery']);
  }

  resetdata() {
    this.leaveAllocationForm.reset();
    this.modalService.dismissAll();
    localStorage.removeItem('loadEntitlement');
    this.route.navigate(['/settings/timeoff-configurations/load-entitlement/carry-forward']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}