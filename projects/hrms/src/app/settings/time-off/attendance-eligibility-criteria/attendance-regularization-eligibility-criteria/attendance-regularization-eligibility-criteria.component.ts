import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IPermissionsvalue } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-regularization-eligibility-criteria',
  imports: [CommonModule, NoDataFoundComponent,FormsModule],
  templateUrl: './attendance-regularization-eligibility-criteria.component.html',
  styleUrl: './attendance-regularization-eligibility-criteria.component.scss'
})
export class AttendanceRegularizationEligibilityCriteriaComponent implements OnInit, OnDestroy {
  permissionsvalue=[] as IPermissionsvalue[];
  editingIndex: number | null = null;
  temporaryValue: any;
  valueId!: number
  currentEntity!:string;
  validationError!:any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService,private sharedModalService: OpenModalService,public rbac: RbacService) {}

  ngOnInit(): void {
    this.getdatabyentriy();
  }



  getdatabyentriy() {
    this.disableEdit();
    const params = 'AttendanceRegularization'
    const param = ["maxRegularizePerDay", 'maxRegularizePerMonth']
    this.http.getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.permissionsvalue = data as IPermissionsvalue[];
      }, error(err) {
        console.log("errors", err)
      },
    });
  }


  validateDecimal(event: KeyboardEvent, criteriaName:string) {
    // if(criteriaName === 'expiryDays' || criteriaName === 'minAppliedDays' || criteriaName === 'pastDatesAllowed' || criteriaName === 'maxRegularizePerDay' || criteriaName === 'maxRegularizePerMonth'){
    //   if (!/^\d$/.test(criteriaName) ) {
    //     event.preventDefault(); // Prevent any non-digit characters
    //   }
    // }
    const inputChar = String.fromCharCode(event.charCode);
    const inputElement = event.target as HTMLInputElement;
    const currentValue = inputElement.value;
    const newValue = currentValue.slice(0, inputElement.selectionStart!) + inputChar + currentValue.slice(inputElement.selectionEnd!);
    const decimalPattern = /^\d{0,3}(\.\d{0,2})?$/;
    if (!decimalPattern.test(newValue)) {
      event.preventDefault();
    }
  }

  
  enableEditForPermissionRegulization(index: number, valueId: number, currentValue: any, entity:string) {
    this.editingIndex = index;
    this.valueId = valueId
    this.temporaryValue = currentValue;
    this.currentEntity=entity;
  }

  disableEdit() {
    this.editingIndex = null;
    this.temporaryValue = null;
  }

  submitPermissionEligibilityValue(index: number, value: any) {
    this.disableEdit();
    if(this.currentEntity === 'AttendanceRegularization'){
     this.validationError = this.validateregularizationvalueValue(this.valueId, value);
    }
    else{
       this.validationError = this.validatePermissionEligibilityValue(this.valueId, value);
    }
    
    if (this.validationError) {
      this.sharedModalService.openErrorModal(this.validationError);
      // this.toaster.error({
      //   detail: 'ERROR',
      //   summary: this.validationError,
      //   duration: 5000,
      // });
      return; 
    }
    const data = {
      id: this.valueId,
      value: value
    }
    this.http.updatePermissionEligibilityValues(`entityAttributeValues/update`, data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
  
        this.getdatabyentriy();
       
        // this.toaster.success({
        //   detail: 'SUCCESS',
        //   summary: 'Data Updated Successfully',
        //   duration: 2000,
        // });
      },
      error: (err) => {
        
        // this.toaster.error({
        //   detail: 'ERROR',
        //   summary: 'Some Thing Went Wrong',
        //   duration: 3000,
        // });
      }
    })
  }

  validateregularizationvalueValue(id: number, value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return 'Value cannot be null or empty.';
    }

    const currentCriteria = this.permissionsvalue;
    const criteria = currentCriteria.find((c) => c.id === id);

    if (!criteria) {
      return 'Criteria not found.';
    }

    switch (criteria.attribute) {
      case 'maxRegularizePerDay':
        if (isNaN(value) || value <= 0 || value > 99) {
          return 'Max Regularize Per Day should be greater than 0 and less than or equals to 99.';
        }
        break;

      case 'maxRegularizePerMonth':
        if (isNaN(value) || value<= 0 || value > 999) {
          return 'Max Regularize Per Month should be greater than 0 and less than or equals to 999.';
        }
        break;

      case 'maxRegularizeHoursPerDay':
        if (isNaN(value) || value <= 0 || value > 24) {
          return 'Max Regularize Hours Per Day should be greater than 0 and less than or equals to 24 Hours.';
        }
        break;

      default:
        if (isNaN(value) || value < 0) {
          return `Invalid value for ${criteria.attribute}.`;
        }
    }

    return null;
  }


  validatePermissionEligibilityValue(id: number, value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return 'Value cannot be null or empty.';
    }
    const currentCriteria = this.permissionsvalue;
    const criteria = currentCriteria.find((c) => c.id === id);

    if (!criteria) {
      return 'Criteria not found.';
    }

    switch (criteria.attribute) {

      case 'pastDatesAllowed':
        if (isNaN(value) || value < 1 || value > 31) {
          return 'Past Dates Allowed should be between 1 and 31.';
        }
        break;

      case 'allowedPerDay':
        if (isNaN(value) || value <= 0 ||  value > 24) {
          return 'Allowed Per Day should be greater than 0 and Less than or equals to 24 Hours.';
        }
        break;

      case 'allowedPerMonth':
        if (isNaN(value) || value <= 0 || value > 744) {
          return 'Allowed Per Month should be greater than 0 and less than or equals to 744 Hours.';
        }
        break;

      case 'maxHoursPerDay':
        if (isNaN(value) || value <= 0 || value > 24) {
          return 'Max Hours Per Day should be greater than 0 and less than or equal to 24 Hours.';
        }
        break;

      case 'maxHoursPerMonth':
        if (isNaN(value) || value <= 0 || value > 744) {
          return 'Max Hours Per Month should be greater than 0 and less than or equal to 744 Hours.';
        }
        break;

      default:
        if (isNaN(value) || value <= 0) {
          return `Invalid value for ${criteria.attribute}.`;
        }
    }
    return null;
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
