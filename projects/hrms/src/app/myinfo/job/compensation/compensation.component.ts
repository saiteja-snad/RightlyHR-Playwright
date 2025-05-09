import { Component } from '@angular/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { AuthService } from '../../../services/auth.service';
import { ICompensation, Icompensation, IFrequency, IOvertime, IPayType } from '../../../Interfaces/job-model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-compensation',
  imports: [CommonModule, ReactiveFormsModule, Select, NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent],
  templateUrl: './compensation.component.html',
  styleUrl: './compensation.component.scss'
})
export class CompensationComponent {
  subscription!: Subscription;
  compForm!: FormGroup;
  compupdateForm!: FormGroup
  overtimeDetails = [] as IOvertime[];
  paytypeDetails = [] as IPayType[];
  frequencyDetails = [] as IFrequency[];
  compensationdetails = new BehaviorSubject<any>([])
  compensationReason = [] as ICompensation[]
  COMPDETAILS = { submitted: false, isempeffectivevaild: true };
  empinfo: any
  selectedid: any;
  loading=false
  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public rbac: RbacService
  ) { }

  ngOnInit() {
    this.intizationFrom()
    this.intizationupdateFrom()
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getCompensationempid()
    this.getFrequency()
    this.getpaytype()
    this.getOvertime()
    this.getCompensationresondropdown()
  }
  intizationFrom() {
    this.compForm = this.fb.group({
      compeffectivedate: [null, Validators.required],
      reason: [null, Validators.required],
      paytype: [null, Validators.required],
      overtimeeligibility: [null, Validators.required],
      frequency: [null, Validators.required],
      compensationamount: [null, [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }


  intizationupdateFrom() {
    this.compupdateForm = this.fb.group({
      compeffectivedate: [null, [Validators.required]],
      reason: [null, Validators.required],
      paytype: [null, Validators.required],
      overtimeeligibility: [null, Validators.required],
      frequency: [null, Validators.required],
      compensationamount: [null, [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }
  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }


  //function to get overtime dropdown
  getOvertime() {
    this.subscription = this.http.getData('Overtime').subscribe({
      next: (data: any) => {
        console.log(data);
        this.overtimeDetails = data as IOvertime[];
      },
    });
  }

  //function to get paytype dropdown
  getpaytype() {
    this.subscription = this.http.getData('PayType').subscribe({
      next: (data: any) => {
        console.log(data);
        this.paytypeDetails = data as IPayType[];
      },
    });
  }

  //function to get frequency dropdown
  getFrequency() {
    this.subscription = this.http.getData('Frequency').subscribe({
      next: (data: any) => {
        console.log(data);
        this.frequencyDetails = data as IFrequency[];
      },
    });
  }
  getCompensationresondropdown() {
    this.subscription = this.http.getData('CompensationReason').subscribe({
      next: (data: any) => {
        console.log(data);
        this.compensationReason = data as ICompensation[];
      },
    });
  }

  getCompensationempid() {
    this.loading=true
    let employeeId = parseInt(this.empinfo.employeeId);
    console.log(employeeId);
    this.subscription = this.http
      .getData(`Compensationdata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.loading=false
          this.compensationdetails.next(data)
        },
      })
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }




}
