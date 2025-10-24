import { Component, OnDestroy, OnInit } from '@angular/core';
import { WfhAllocationTabsComponent } from "../wfh-allocation-tabs/wfh-allocation-tabs.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-wfh-allocation-view',
  imports: [WfhAllocationTabsComponent,CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, NoDataFoundComponent,],
  templateUrl: './wfh-allocation-view.component.html',
  styleUrl: './wfh-allocation-view.component.scss'
})
export class WfhAllocationViewComponent implements OnInit,OnDestroy{
  selectedEmployee=[] as any;
  
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
     private modal: OpenModalService,
     private modalService: NgbModal,
     public rbac: RbacService
  ) { }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
