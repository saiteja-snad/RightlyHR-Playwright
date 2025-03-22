import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TimeOffTabsComponent } from '../../shared/time-off-tabs/time-off-tabs.component';
import { RouterModule } from '@angular/router';
import { WfhApprovaltabsComponent } from "../../shared/wfh-approvaltabs/wfh-approvaltabs.component";

@Component({
  selector: 'app-work-from-home',
  imports: [CommonModule, RouterModule, WfhApprovaltabsComponent],
  templateUrl: './work-from-home.component.html',
  styleUrl: './work-from-home.component.scss'
})
export class WorkFromHomeComponent {

}
