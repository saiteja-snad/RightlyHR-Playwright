import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-rejected-tickets',
  imports: [NoDataFoundComponent],
  templateUrl: './rejected-tickets.component.html',
  styleUrl: './rejected-tickets.component.scss'
})
export class RejectedTicketsComponent {

}
