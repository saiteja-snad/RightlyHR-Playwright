import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { HttpService } from '../../../../../services/http.service';
import { OpenModalService } from '../../../../../services/open-modal.service';
import { ILocation, IShiftHeader, ISubLocation } from '../../../flexible-leave-allocation/leave-allocation.model';
@Component({
  selector: 'app-load-entitlement-create',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Select],
  templateUrl: './load-entitlement-create.component.html',
  styleUrl: './load-entitlement-create.component.scss'
})

export class LoadEntitlementCreateComponent {
  empinfo: any = {};
  leaveAllocationForm!: FormGroup;
  carryforwarddata: any = {}
  spinnerLoader: boolean = false;
  subscription!: Subscription;
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private fb: FormBuilder, public formValidations: FormValidationsService, private modalService: NgbModal,
    private route: Router, private http: HttpService, public formValidation: FormValidationsService,
    private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}')
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
        location: this.carryforwarddata.location
      });
    }

  }

  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    let yearsList: number[] = []
    for (let i = -1; i < 11; i++) {
      yearsList.push(currentYear + i);
    }
    return yearsList;
  }

  enableLocation(): void {
    if (this.leaveAllocationForm.get('year')?.value) {
      this.leaveAllocationForm.get('location')?.enable();
    }
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.locationDetails = res.jobLocations || [];
          // Auto-load subLocations & shifts if saved data exists
          if (this.carryforwarddata?.location?.jobLocationName) {
            const selectedLocation = this.locationDetails.find(
              (loc: any) => loc.jobLocationName === this.carryforwarddata?.location?.jobLocationName
            );
            if (selectedLocation) {
              this.onLocationChange(selectedLocation);
              this.leaveAllocationForm.patchValue({
                location: selectedLocation
              });
            }
          }
        },
        error: err => console.error('Error fetching locations:', err)
      });
  }


  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.leaveAllocationForm.get('subLocation')?.enable();
      this.leaveAllocationForm.get('subLocation')?.reset();
      //Auto-populate subLocation if stored
      if (this.carryforwarddata?.subLocation) {
        const selectedSub = this.subLocationDetails.find((item: any) =>
          item.jobSubLocationName === this.carryforwarddata.subLocation.jobSubLocationName
        );
        if (selectedSub) {
          this.leaveAllocationForm.patchValue({ subLocation: selectedSub });
          this.getAllShifts(selectedSub);
        }
      }

    } else {
      this.subLocationDetails = [];
      this.leaveAllocationForm.get('subLocation')?.enable();
      this.leaveAllocationForm.get('subLocation')?.reset();
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id
    };
    this.http.getDataWithQueryParams(`orgShifts/getshiftlocation`, params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.shiftDetails = res.flatMap((header: any) => header.orgShiftsItems || []);
        this.leaveAllocationForm.get('shift')?.enable();
        this.leaveAllocationForm.get('shift')?.reset();
        // Auto-select saved shift
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
        this.leaveAllocationForm.get('shift')?.disable();
      }
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  sumbitdata() {
    console.log(this.leaveAllocationForm.value)
    localStorage.setItem('loadEntitlement', JSON.stringify(this.leaveAllocationForm.value));
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-preview'])
  }

  resetdata() {
    this.leaveAllocationForm.reset();
    localStorage.removeItem('loadEntitlement')
    this.route.navigate([
      '/settings/timeoff-configurations/load-entitlement/carry-forward'
    ]);

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}