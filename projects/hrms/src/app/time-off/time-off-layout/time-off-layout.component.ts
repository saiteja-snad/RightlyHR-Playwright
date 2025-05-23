import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimeOffTabsComponent } from "../../shared/time-off-module-tabs/time-off-tabs/time-off-tabs.component";

@Component({
  selector: 'app-time-off-layout',
  imports: [CommonModule, RouterOutlet, TimeOffTabsComponent],
  templateUrl: './time-off-layout.component.html',
  styleUrl: './time-off-layout.component.scss'
})
export class TimeOffLayoutComponent {

}
