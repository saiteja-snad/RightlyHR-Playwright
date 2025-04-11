import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-my-info-personal-tabs',
  imports: [RouterModule],
  templateUrl: './my-info-personal-tabs.component.html',
  styleUrl: './my-info-personal-tabs.component.scss'
})
export class MyInfoPersonalTabsComponent {

  constructor(
    public rbac: RbacService
  ){}
}
