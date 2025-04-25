import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItsupportCompomentTabsComponent } from "../../shared/itsupport-compoment-tabs/itsupport-compoment-tabs.component";


@Component({
  selector: 'app-team-tickets',
  imports: [RouterModule, ItsupportCompomentTabsComponent],
  templateUrl: './team-tickets.component.html',
  styleUrl: './team-tickets.component.scss'
})
export class TeamTicketsComponent {

}
