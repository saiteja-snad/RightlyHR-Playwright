import { Component } from '@angular/core';
import { PremissionsTabsComponent } from "../../shared/premissions-tabs/premissions-tabs.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-premissions',
  imports: [PremissionsTabsComponent,RouterModule],
  templateUrl: './premissions.component.html',
  styleUrl: './premissions.component.scss'
})
export class PremissionsComponent {

}
