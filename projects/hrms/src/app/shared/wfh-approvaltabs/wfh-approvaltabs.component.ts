import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-wfh-approvaltabs',
  imports: [RouterModule],
  templateUrl: './wfh-approvaltabs.component.html',
  styleUrl: './wfh-approvaltabs.component.scss'
})
export class WfhApprovaltabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}
