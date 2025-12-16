import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { RateCardTabsComponent } from "../rate-card-tabs/rate-card-tabs.component";
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
@Component({
  selector: 'app-rate-card-layout',
  imports: [CommonModule, RouterModule, RateCardTabsComponent, SettingsHeaderComponent],
  templateUrl: './rate-card-layout.component.html',
  styleUrl: './rate-card-layout.component.scss'
})
export class RateCardLayoutComponent {
constructor(public readonly router: Router) { }
}
