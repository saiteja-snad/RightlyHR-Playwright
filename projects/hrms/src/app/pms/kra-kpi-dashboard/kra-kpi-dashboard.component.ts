import { Component } from '@angular/core';
import { KraKpiManagementLayoutComponent } from '../kra-kpi-management-layout/kra-kpi-management-layout.component';
import { NgbModal, NgbModalRef, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';

@Component({
  selector: 'app-kra-kpi-dashboard',
  imports: [KraKpiManagementLayoutComponent,TranslateModule,NgbPopoverModule,CommonModule,ModuleInfoIconComponent],
  templateUrl: './kra-kpi-dashboard.component.html',
  styleUrl: './kra-kpi-dashboard.component.scss'
})
export class KraKpiDashboardComponent {

}
