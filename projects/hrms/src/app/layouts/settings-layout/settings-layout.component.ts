import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { SettingSideNavComponent } from "../../shared/setting-side-nav/setting-side-nav.component";
@Component({
  selector: 'app-settings-layout',
  imports: [HeaderComponent, RouterOutlet, SettingSideNavComponent],
  templateUrl: './settings-layout.component.html',
  styleUrl: './settings-layout.component.scss'
})

export class SettingsLayoutComponent {

}
