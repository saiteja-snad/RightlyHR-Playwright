import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { IWfhAllocationViewModel } from './wfh-allocation-view-model';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { Paginator } from 'primeng/paginator';
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { DateformatPipe } from '../../../../pipes/dateformat.pipe';
import { RouterModule } from '@angular/router';
import { WfhAllocationHistoryTabsComponent } from '../wfh-allocation-history-tabs/wfh-allocation-history-tabs.component';

@Component({
  selector: 'app-wfh-allocation-view',
  imports: [RouterModule, WfhAllocationHistoryTabsComponent],
  templateUrl: './wfh-allocation-view.component.html',
  styleUrl: './wfh-allocation-view.component.scss',
})
export class WfhAllocationViewComponent {}
