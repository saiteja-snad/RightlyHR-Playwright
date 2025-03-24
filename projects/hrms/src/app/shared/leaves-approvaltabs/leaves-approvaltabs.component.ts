import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-leaves-approvaltabs',
  imports: [RouterModule],
  templateUrl: './leaves-approvaltabs.component.html',
  styleUrl: './leaves-approvaltabs.component.scss'
})
export class LeavesApprovaltabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}
