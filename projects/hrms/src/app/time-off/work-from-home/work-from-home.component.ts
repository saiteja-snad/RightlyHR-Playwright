import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TimeOffTabsComponent } from '../../shared/time-off-tabs/time-off-tabs.component';

@Component({
  selector: 'app-work-from-home',
  imports: [CommonModule,TimeOffTabsComponent],
  templateUrl: './work-from-home.component.html',
  styleUrl: './work-from-home.component.scss'
})
export class WorkFromHomeComponent {

}
