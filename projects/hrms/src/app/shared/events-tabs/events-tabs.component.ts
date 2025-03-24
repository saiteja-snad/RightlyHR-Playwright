import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-events-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './events-tabs.component.html',
  styleUrl: './events-tabs.component.scss'
})
export class EventsTabsComponent {

}
