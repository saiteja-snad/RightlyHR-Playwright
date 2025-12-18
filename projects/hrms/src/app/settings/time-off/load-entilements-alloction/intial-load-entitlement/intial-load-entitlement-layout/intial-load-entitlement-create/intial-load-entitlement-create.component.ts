import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { FormValidationsService } from '../../../../../../services/form-validations.service';
import { HttpService } from '../../../../../../services/http.service';
import { OpenModalService } from '../../../../../../services/open-modal.service';
import { ILocation, ISubLocation, IShiftHeader, ICategoryDetails } from '../../../../flexible-leave-allocation/leave-allocation.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-intial-load-entitlement-create',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MultiSelectModule, Select],
  templateUrl: './intial-load-entitlement-create.component.html',
  styleUrl: './intial-load-entitlement-create.component.scss'
})
export class IntialLoadEntitlementCreateComponent {
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
  categoryDetails = [] as ICategoryDetails[];
  constructor(private fb: FormBuilder, public formValidations: FormValidationsService, private modalService: NgbModal,
    private route: Router, private http: HttpService, public formValidation: FormValidationsService,
    private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('intialloadEntitlement') ?? '{}')
    this.yearsList = this.getYears();
    this.leaveAllocationForm = this.fb.group({
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      categoryName: [null, Validators.required],
    });
    this.getAllLocations();
    if (this.carryforwarddata) {
      this.leaveAllocationForm.enable();
      this.leaveAllocationForm.patchValue({
        year: this.carryforwarddata.year,
        location: this.carryforwarddata.location,


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
              (loc: any) => loc.jobLocationName === this.carryforwarddata.location.jobLocationName
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
      this.leaveAllocationForm.get('shift')?.reset();
      this.leaveAllocationForm.get('categoryName')?.reset();
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
        this.leaveAllocationForm.get('categoryName')?.reset();
        // Auto-select saved shift
        if (this.carryforwarddata?.shift) {
          const selectedShift = this.shiftDetails.find((sh: any) => sh.shiftName === this.carryforwarddata.shift.shiftName);
          if (selectedShift) {
            this.leaveAllocationForm.patchValue({ shift: selectedShift });
            this.getCategoryDetails(selectedShift);
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


  getCategoryDetails(policy: any): void {
    console.log(policy);

    let params = {
      locationId: this.leaveAllocationForm.get('location')?.value?.id,
      subLocationId: this.leaveAllocationForm.get('subLocation')?.value?.id,
      year: this.leaveAllocationForm.get('year')?.value,
      status: 'Published',
      shiftId: policy.id
    };
    console.log(params);

    this.http.getDataWithQueryParams("OrgLeavesCategories", params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.categoryDetails = res;

        // Pre-select categories from localStorage
        if (this.carryforwarddata?.categoryIds?.length) {
          this.leaveAllocationForm.patchValue({
            categoryName: this.carryforwarddata.categoryIds
          });
        }
      },
      error: err => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  sumbitdata() {
    const formValue = this.leaveAllocationForm.value;

    const payload = {
      year: formValue.year,
      location: formValue.location,
      subLocation: formValue.subLocation,
      shift: formValue.shift,
      categoryIds: formValue.categoryName || []
    };

    localStorage.setItem(
      'intialloadEntitlement',
      JSON.stringify(payload)
    );

    this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-preview']);
  }

  resetdata() {
    this.leaveAllocationForm.reset();
    this.modalService.dismissAll();
    localStorage.removeItem('intialloadEntitlement')
    this.route.navigate([
      '/settings/timeoff-configurations/load-entitlement/initial-load-entitlements'
    ]);

  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
