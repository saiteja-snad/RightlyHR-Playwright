import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItsuporrtHeaderTabsComponent } from "../../shared/itsuporrt-header-tabs/itsuporrt-header-tabs.component";

@Component({
  selector: 'app-itsupport-lay-out',
  imports: [RouterModule, ItsuporrtHeaderTabsComponent],
  templateUrl: './itsupport-lay-out.component.html',
  styleUrl: './itsupport-lay-out.component.scss'
})
export class ItsupportLayOutComponent {

}
