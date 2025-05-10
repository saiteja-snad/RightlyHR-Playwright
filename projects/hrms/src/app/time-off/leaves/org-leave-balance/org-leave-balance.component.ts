import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-org-leave-balance',
  imports: [CommonModule,Select,AccordionModule],
  templateUrl: './org-leave-balance.component.html',
  styleUrl: './org-leave-balance.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class OrgLeaveBalanceComponent {

}
