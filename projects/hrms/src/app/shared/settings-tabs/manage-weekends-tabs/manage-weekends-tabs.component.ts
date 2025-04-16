import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-weekends-tabs',
  imports: [RouterModule,CommonModule],
  templateUrl: './manage-weekends-tabs.component.html',
  styleUrl: './manage-weekends-tabs.component.scss'
})
export class ManageWeekendsTabsComponent {
  navLinks = [
    { label: 'Pending for submission', route: '/settings/employee-fields/manage-dst/pending-for-submission' },
    { label: 'Published', route: '/settings/employee-fields/manage-dsts/published-weekends' },
  ];
}
