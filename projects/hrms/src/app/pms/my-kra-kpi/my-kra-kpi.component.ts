import { Component } from '@angular/core';
import { KraKpiManagementLayoutComponent } from '../kra-kpi-management-layout/kra-kpi-management-layout.component';
import { NgbModal, NgbModalRef, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';





@Component({
  selector: 'app-my-kra-kpi',
  imports: [KraKpiManagementLayoutComponent,TranslateModule,NgbPopoverModule,CommonModule,ModuleInfoIconComponent],
  standalone: true,
  templateUrl: './my-kra-kpi.component.html',
  styleUrl: './my-kra-kpi.component.scss'
})
export class MyKraKpiComponent {

}
