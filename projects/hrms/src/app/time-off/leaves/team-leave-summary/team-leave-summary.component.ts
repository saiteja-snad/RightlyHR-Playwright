import { Component } from '@angular/core';
import { LeavesApprovaltabsComponent } from "../../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component";
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-team-leave-summary',
  imports: [LeavesApprovaltabsComponent,CommonModule,Select],
  templateUrl: './team-leave-summary.component.html',
  styleUrl: './team-leave-summary.component.scss'
})
export class TeamLeaveSummaryComponent {

}
