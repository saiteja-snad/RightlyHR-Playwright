import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-open-tickets',
  imports: [NoDataFoundComponent],
  templateUrl: './open-tickets.component.html',
  styleUrl: './open-tickets.component.scss'
})
export class OpenTicketsComponent {

}
