import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { IEligibilityCriteria } from '../../../../Interfaces/timoff-model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { FormsModule } from '@angular/forms';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-wfh-entitlemen-criteria',
  imports: [CommonModule, NoDataFoundComponent, FormsModule, DataLoaderContentComponent],
  templateUrl: './wfh-entitlemen-criteria.component.html',
  styleUrl: './wfh-entitlemen-criteria.component.scss'
})
export class WFHEntitlemenCriteriaComponent implements OnInit, OnDestroy {
  eligibilityCriterias = [] as IEligibilityCriteria[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  editingIndex: number | null = null;
  temporaryValue: any;
  valueId!: number
  currentEntity!:string;
  validationError!:any;
  dataLoad = false;
  constructor(private http: HttpService,private sharedModalService: OpenModalService,public rbac: RbacService) {}

  ngOnInit(): void {
    this.WorkFromHomeEligibilityCriteria('WorkFromHomeEligibilityCriteria');
  }

  WorkFromHomeEligibilityCriteria(eligibilityType: string) {
    this.dataLoad = true;
    this.http.getData(eligibilityType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.eligibilityCriterias = (data as unknown as IEligibilityCriteria[])?.sort((a, b) => a.id - b.id);
        this.dataLoad = false;
      },
      error: (reason) =>{ 
        console.log(reason)
        this.dataLoad = false;
      },
      complete: () => {},
    });
  }

  validateDecimal(event: KeyboardEvent, criteriaName:string) {
    const inputChar = String.fromCharCode(event.charCode);
    const inputElement = event.target as HTMLInputElement;
    const currentValue = inputElement.value;
    const newValue = currentValue.slice(0, inputElement.selectionStart!) + inputChar + currentValue.slice(inputElement.selectionEnd!);
    const decimalPattern = /^\d{0,3}(\.\d{0,2})?$/;
    if (!decimalPattern.test(newValue)) {
      event.preventDefault();
    }
  }

  enableEdit(index: number, valueId: number, currentValue: any) {
    this.editingIndex = index;
    this.valueId = valueId
    this.temporaryValue = currentValue;
  }

  
  validateWFHValue(id: number, value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return 'Value cannot be null or empty.';
    }

    const currentCriteria = this.eligibilityCriterias;
    const criteria = currentCriteria.find((c) => c.id === id);

    if (!criteria) {
      return 'Criteria not found.';
    }

    switch (criteria.name) {
      case 'minHalfDayHours':
        if (isNaN(value) || value <= 0 || value > 12) {
          return 'Min Half Day Hours should be greater than 0 and less than or equal to 12.';
        }
        break;

      case 'minFullDayHours':
        if (isNaN(value) || value <= 0 || value > 24) {
          return 'Min Full Day Hours should be greater than 0 and less than or equal to 24.';
        }
        break;

      case 'maxDuration':
        if (isNaN(value) || value <= 0 || value > 300) {
          return 'Max Duration should be greater than 0 and less than or equal to 300.';
        }
        break;

      default:
        if (isNaN(value) || value < 0) {
          return `Invalid value for ${criteria.name}.`;
        }
    }

    return null;
  }
  
  disableEdit() {
    this.editingIndex = null;
    this.temporaryValue = null;
  }
  submitWFHValue(index: number, value: any) {
    this.disableEdit();
    const validationError = this.validateWFHValue(this.valueId, value);
    if (validationError) {
      this.sharedModalService.openErrorModal(validationError)
      return; 
    }
    const data = {
      id: this.valueId,
      value: value
    }
    this.http.updateWFHValues(`WorkFromHomeEligibilityCriteria/update`, data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.WorkFromHomeEligibilityCriteria('WorkFromHomeEligibilityCriteria');
        this.sharedModalService.openSuccessModal('Data Updated Successfully');
      },
      error: (err :any) => {
        this.sharedModalService.openErrorModal("Some Thing Went Wrong")
     
      }
    })
  }


  

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
