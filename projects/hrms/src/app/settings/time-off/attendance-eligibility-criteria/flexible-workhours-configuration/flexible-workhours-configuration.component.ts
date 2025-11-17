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
  selector: 'app-flexible-workhours-configuration',
  imports: [CommonModule, NoDataFoundComponent, FormsModule, TranslateModule, DataLoaderContentComponent],
  templateUrl: './flexible-workhours-configuration.component.html',
  styleUrl: './flexible-workhours-configuration.component.scss'
})
export class FlexibleWorkhoursConfigurationComponent implements OnInit, OnDestroy {
  dataLoad = false;
  editingIndex: number | null = null;
  valueId!: number;
  temporaryValue: any;
  isValueInvalid = false;
  flexibleWorkhours = new BehaviorSubject<ILateLoginSetting[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService, private sharedModalService: OpenModalService, public rbac: RbacService) {}

  ngOnInit(): void {
    this.getFlexibleWorkhoursData();
  }

  enableEdit(index: number, id: any, value: any) {
    this.editingIndex = index;
    this.temporaryValue = value;
    this.isValueInvalid = false;
  }

  disableEdit() {
    this.editingIndex = null;
    this.temporaryValue = null;
  }

  validateNumber(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  checkValueRange() {
    const value = parseInt(this.temporaryValue);
    this.isValueInvalid = isNaN(value) || value < 0;
  }

  submitForm(index: number, id: number, updatedValue: any) {
    this.disableEdit();
    const payload = {
      id: id,
      value: updatedValue?.toString()
    };

    this.http.upadteLateLoginValues('entityAttributeValues/update', payload).subscribe({
      next: () => {
        this.getFlexibleWorkhoursData();
        this.sharedModalService.openSuccessModal("Flexible Work Hours Configuration Updated successfully");
      },
      error: (err) => {
        this.sharedModalService.openErrorModal(err.error);
      }
    });
  }

  getFlexibleWorkhoursData() {
    this.disableEdit();
    const params = 'FlexibleWorkhours';
    const param = ['futureDatesAllowed', 'pastDatesAllowed'];
    this.http.getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.flexibleWorkhours.next(data);
      },
      error(err) {
        console.log("errors", err);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
