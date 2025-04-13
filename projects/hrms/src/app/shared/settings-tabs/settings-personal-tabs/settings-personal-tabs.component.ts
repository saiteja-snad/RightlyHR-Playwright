import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-settings-personal-tabs',
  imports: [RouterModule,CommonModule],
  templateUrl: './settings-personal-tabs.component.html',
  styleUrl: './settings-personal-tabs.component.scss'
})

export class SettingsPersonalTabsComponent {
  navLinks = [
    { label: 'Salutation', route: '/settings/employee-fields/personal/salutation' },
    { label: 'Status', route: '/settings/employee-fields/personal/status' },
    { label: 'Gender', route: '/settings/employee-fields/personal/gender' },
    { label: 'Marital Status', route: '/settings/employee-fields/personal/maritalstatus' },
    { label: 'Degree', route: '/settings/employee-fields/personal/degree' },
    { label: 'Visa Type', route: '/settings/employee-fields/personal/visatype' },
    { label: 'Identity Type', route: '/settings/employee-fields/personal/identitytype' },
    { label: 'Relationship', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Bank Names', route: '/settings/employee-fields/personal/bank-name' }
  ];
}
