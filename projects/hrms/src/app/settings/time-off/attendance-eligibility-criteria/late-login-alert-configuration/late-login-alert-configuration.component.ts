import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ILateLoginSetting } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-late-login-alert-configuration',
  imports: [CommonModule, NoDataFoundComponent, FormsModule,TranslateModule, DataLoaderContentComponent],
  templateUrl: './late-login-alert-configuration.component.html',
  styleUrl: './late-login-alert-configuration.component.scss'
})
export class LateLoginAlertConfigurationComponent implements OnInit,OnDestroy {
  dataLoad = false;
  editingIndex: number | null = null;
  valueId!: number
  temporaryValue: any;
  currentEntity!:string;
  isThresholdInvalid = false;
  lateLogin = new BehaviorSubject<ILateLoginSetting[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService, private sharedModalService: OpenModalService, public rbac: RbacService){}

  ngOnInit(): void {
    this.getlatelogindata();
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

  validateDecimal(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    const inputElement = event.target as HTMLInputElement;
    const currentValue = inputElement.value;
    const newValue = currentValue.slice(0, inputElement.selectionStart!) + inputChar + currentValue.slice(inputElement.selectionEnd!);
    const decimalPattern = /^\d{0,3}(\\d{0,2})?$/;
    if (!decimalPattern.test(newValue)) {
      event.preventDefault();
    }
  }

checkThresholdRange() {
  const value = parseFloat(this.temporaryValue);
  this.isThresholdInvalid = isNaN(value) || value < 1 || value > 480;
}

  validateThreshold() {
  const num = Number(this.temporaryValue);
  this.isThresholdInvalid = num < 1 || num > 480;
  }

enableEditForLateLogin(index: number, id: any, value: any, attribute: string) {
  this.editingIndex = index;
  this.temporaryValue = attribute === 'Enable Alert' ? (value === 'true' || value === true) : value;

  // ✅ Clear previous validation state
  this.isThresholdInvalid = false;
}

  submitLateLoginForm(index: number, id: number, updatedValue: any) {
    this.disableEdit();
    const payload = {
      id: id,
      value: updatedValue?.toString()
    };

    this.http.upadteLateLoginValues('entityAttributeValues/update', payload).subscribe({
      next: () => {
        this.getlatelogindata(); // refresh data
        this.sharedModalService.openSuccessModal("Late Login Alert Configuration Updated successfully");
      },
      error: (err) => {
        this.sharedModalService.openErrorModal(err.error);
      }
    });
  }

  getlatelogindata() {
    this.disableEdit();
    const params = 'LateLoginEmailNotification'
    const param = ["Enable Alert", 'Late Login Threshold']
    this.http.getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.lateLogin.next(data);
      }, error(err) {
        console.log("errors", err)
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
