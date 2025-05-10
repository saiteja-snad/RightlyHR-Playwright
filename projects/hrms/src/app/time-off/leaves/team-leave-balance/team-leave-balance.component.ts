import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Select } from 'primeng/select';
import { LeavesApprovaltabsComponent } from "../../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component";
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-team-leave-balance',
  imports: [CommonModule, Select, LeavesApprovaltabsComponent,AccordionModule],
  templateUrl: './team-leave-balance.component.html',
  styleUrl: './team-leave-balance.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class TeamLeaveBalanceComponent {

}
