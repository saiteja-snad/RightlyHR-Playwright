import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WfhAllocationHistoryTabsComponent } from '../wfh-allocation-history-tabs/wfh-allocation-history-tabs.component';

@Component({
  selector: 'app-wfh-allocation-view',
  imports: [RouterModule, WfhAllocationHistoryTabsComponent],
  templateUrl: './wfh-allocation-view.component.html',
  styleUrl: './wfh-allocation-view.component.scss',
})
export class WfhAllocationViewComponent {}
