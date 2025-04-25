import { Component, OnDestroy, OnInit } from '@angular/core';

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

@Component({
  selector: 'app-view-dst',
  imports: [SelectModule, CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './view-dst.component.html',
  styleUrl: './view-dst.component.scss',
})
export class ViewDstComponent implements OnInit, OnDestroy {
  dstForm!: FormGroup;
  yearsList: number[] = [];
  empinfo = {} as IJob;
  destroy$ = new Subject<void>();
  locationDetails: ILocation[] = [];
  subLocationDetails: ISubLocation[] = [];
  shiftDetails: IShiftHeader[] = [];
  momentType: string[] = ['Forward', 'Backward'];
  durations: number[] = [1, 1.5, 2, 2.5, 3];
  publishedDST: ManageDST | null = null;
  hidePublishCloneButtons: boolean = false;

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

    const localStorageData = localStorage.getItem('publishedDST');
    if (localStorageData) {
      this.publishedDST = JSON.parse(localStorageData);
    }

    if (this.publishedDST) {
      this.dstForm.patchValue({
        year: this.publishedDST.applicableYear,
      });
    }

    this.getAllLocations();
  }

  inititializeForm() {
    this.dstForm = this.fb.group({
      year: [{ value: '', disabled: true }, Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: null, disabled: true }, Validators.required],
      momentRows: this.fb.array([]),
    });

    if (!this.publishedDST?.dayLight?.length) {
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

  removeMomentRow(index: number) {
    this.momentRows.removeAt(index);
  }

  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => currentYear - 1 + i);
  }

  onLocationChange(location: ILocation): void {
    this.subLocationDetails = location.jobSubLocations ?? [];
    this.dstForm.get('subLocation')?.enable();
    this.dstForm.get('subLocation')?.reset();
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id,
    };

    this.http
      .getDataWithQueryParams('orgShifts/getshiftlocation', params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.shiftDetails = res.flatMap(
            (header: any) => header.orgShiftsItems ?? []
          );
          const matchedShift = this.shiftDetails.find(
            (s) => s.id === this.publishedDST?.shiftId
          );
          this.dstForm.patchValue({ shift: matchedShift ?? null });
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
            (loc) => loc.id === this.publishedDST?.locationId
          );
          this.subLocationDetails = selectedLocation?.jobSubLocations ?? [];

          const selectedSubLocation = this.subLocationDetails.find(
            (sub) => sub.id === this.publishedDST?.sublocationId
          );

          this.dstForm.patchValue({
            location: selectedLocation ?? null,
            subLocation: selectedSubLocation ?? null,
          });

          if (selectedSubLocation) {
            this.getAllShifts(selectedSubLocation);
          }

          // Patch moment rows
          if (this.publishedDST?.dayLight?.length) {
            this.momentRows.clear();
            this.publishedDST.dayLight.forEach((row) => {
              this.momentRows.push(
                this.fb.group({
                  startDate: {
                    value: this.formatToDateInput(row.startDate),
                    disabled: true,
                  },
                  endDate: {
                    value: this.formatToDateInput(row.endDate),
                    disabled: true,
                  },
                  momentType: { value: row.momentType, disabled: true },
                  duration: { value: row.duration, disabled: true },
                })
              );
            });
          }
        },
        error: (err) => console.error('Error fetching locations:', err),
      });
  }

  formatToDateInput(dateStr: string): string {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  navigate(): void {
    this.router.navigate(['/settings/employee-fields/manage-dsts']);
  }

  navigateToCloneComponent(): void {
    localStorage.setItem('cloneDST', JSON.stringify(this.publishedDST));
    this.router.navigate(['/settings/employee-fields/clone-dst']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
