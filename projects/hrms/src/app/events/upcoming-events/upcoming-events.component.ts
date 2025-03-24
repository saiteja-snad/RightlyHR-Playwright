import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EventsTabsComponent } from "../../shared/events-tabs/events-tabs.component";
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEventComponent } from './add-event/add-event.component';

@Component({
  selector: 'app-upcoming-events',
  imports: [CommonModule, EventsTabsComponent],
  templateUrl: './upcoming-events.component.html',
  styleUrl: './upcoming-events.component.scss'
})
export class UpcomingEventsComponent {
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  openAddProspective() {
    this.modalService.open(AddEventComponent, { centered: true, backdrop: 'static', size:'lg' });
  }
}
