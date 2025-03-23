import { Component } from '@angular/core';
import { PremissionsTabsComponent } from "../../shared/premissions-tabs/premissions-tabs.component";
import { RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-premissions',
  imports: [PremissionsTabsComponent,RouterModule,Select],
  templateUrl: './premissions.component.html',
  styleUrl: './premissions.component.scss'
})
export class PremissionsComponent {

  constructor(private modalService: NgbModal) {}

  openModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }
  premissionType = [
    { name: 'Short Break', value: 'short-break' },
    { name: 'Half Day', value: 'half-day' },
    { name: 'Full Day', value: 'full-day' },
    { name: 'Work From Home', value: 'work-from-home' }
  ];

  duration = [
    { name: '1 Hour', value: '1-hour' },
    { name: '2 Hours', value: '2-hours' },
    { name: 'Half Day', value: 'half-day' },
    { name: 'Full Day', value: 'full-day' }
  ];

}
