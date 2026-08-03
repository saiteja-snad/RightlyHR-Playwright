import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { IProbation } from './probation-details.model';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SelectModule } from 'primeng/select';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-probation-details',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, DataLoaderContentComponent, TableModule],
  templateUrl: './probation-details.component.html',
  styleUrl: './probation-details.component.scss'
})
export class ProbationDetailsComponent {
  @ViewChild('probationTable') probationTable!: Table;
  subscription!: Subscription;
  getProbationconfigValues = [] as any;
  ProbationDetails = [] as any;
  originalProbationData = [] as any; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  loader = false;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeletedetail: any = null;
  configValueId: number | null = null;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  isUserViewOnly = false;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
    private cdr: ChangeDetectorRef
  ) {

  }
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      Type: ['', [Validators.required]],
      // Duration: ['', [Validators.required, Validators.pattern(/^\d+$/)]]

      Duration: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/)  // only digits allowed
      ]]


    });

    this.updateForm = this.fb.group({
      Type: ['', { disabled: true }, [Validators.required]],
      Duration: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/)  // only digits allowed
      ]]
    });
    this.getProbationDetailstoselectthevalue();
    this.getProbationDetails();
  }

  getProbationDetails() {
    this.loader = true;
    this.subscription = this.http
      .getData('ProbationFlow/settingsprobationconfiggetall')
      .subscribe({
        next: (data: any) => {
          this.loader = false;
          this.ProbationDetails = data;
          this.originalProbationData = [...this.ProbationDetails]; // Store original data
        },
      error: (err: any) => {
        // console.log(err);
        this.loader = false;
      },
      complete: () => {
        this.getProbationDetailstoselectthevalue();
      },
      });
  }
  // allowOnlyNumbers(event: KeyboardEvent): void {
  //   const charCode = event.which ? event.which : event.keyCode;
  //   if (charCode > 31 && (charCode < 48 || charCode > 57)) {
  //     event.preventDefault();
  //   }
  // }
  // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getProbationDetailstoselectthevalue() {
    const moduleId = environment.ProbationrequestmoduleId;
    this.subscription = this.http.getData(`ProbationFlow/settingsconfigvalue/${moduleId}`).subscribe({
      next: (data: any) => {
        // console.log(data);
        this.getProbationconfigValues = data;
        this.getProbationconfigValues = this.getProbationconfigValues.filter(
          (item: any) => !this.ProbationDetails.find((selectedItem: any) => selectedItem.configValueId == item.id)
        );
      },
      error: (err) => {
        // console.error('Error fetching data:', err);
      }
    });
  }
  //ADD
  postProbationData = {} as any;
  addPtobationDetails(modal: any) {
    // const request: IProbation = {
    //   value: this.AddForm.value.Type,
    //   noOfDays: this.AddForm.value.Duration,
    //   configValueId :this.postProbationData.configValueId,
    //   isDeleted : false,
    // };
    const request: IProbation = {
      value: String(this.AddForm.value.Type),
      noOfDays: String(this.AddForm.value.Duration), // optional, looks already like string
      configValueId: String(this.postProbationData.configValueId),
      isDeleted: false,
    };

    this.subscription = this.http.postdata('ProbationFlow/settingsprobationconfigpost', request).subscribe({
      next: () => {

        this.getProbationDetails();
        modal.close();
        this.conformationPopup.openSuccessModal('Probation Details added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
      }
    });
  }

  close(modal: any) {
    this.resetForm();
    modal.close();
  }

  // Method to open the update modal dialog
  openupdateDialog(probationDetailslist: any) {
    this.isUserViewOnly = true;
    this.selectedId = probationDetailslist.id;
    this.configValueId = probationDetailslist.configValueId;
    // console.log("update details:" + probationDetailslist.value);
    this.updateForm.patchValue({ Type: probationDetailslist.value });
    this.updateForm.patchValue({ Duration: probationDetailslist.noOfDays });
    this.cdr.detectChanges();
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }

  //  UPDATE
  updateJobroletype(modal: any) {

    const request = {
      value: this.updateForm.value.Type.trim(),
      noOfDays: this.updateForm.value.Duration,
      configValueId: this.configValueId,
      id: this.selectedId,
      isDeleted: false
    };
    console.log("request", request);
    this.subscription = this.http.postdata('ProbationFlow/settingsprobationconfigupdate', request).subscribe({
      next: () => {
        modal.close();
        this.conformationPopup.openSuccessModal('Probation Details updated successfully');
        this.getProbationDetails();
        // this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
      }
    });

  }
  // Method to open the delete modal dialog
  // DELETE
  opendelete(probationDetailslist: any) {
    this.selectedDeletedetail = probationDetailslist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeletedetail) return;

    this.subscription = this.http
      .getData(`ProbationFlow/settingsprobationconfigdelete/${this.selectedDeletedetail.id}`)
      .subscribe({
        next: () => {
          modal.close();
          this.getProbationDetails();
          this.conformationPopup.openSuccessModal('Probation Details deleted successfully');

        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Insertion of data failed');

        }
      });
  }
  closeDelete(modal: any) {
    modal.dismiss();
  };


  resetForm() {
    this.AddForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.ProbationDetails = [...this.originalProbationData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.probationTable) {
          this.probationTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle specific field mappings
      switch (field) {
        case 'value':
          val1 = a.value;
          val2 = b.value;
          break;
        case 'noOfDays':
          val1 = a.noOfDays;
          val2 = b.noOfDays;
          break;
        default:
          val1 = a[field];
          val2 = b[field];
      }

      // Handle numeric sorting for noOfDays
      if (field === 'noOfDays') {
        const num1 = parseInt(val1) || 0;
        const num2 = parseInt(val2) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
