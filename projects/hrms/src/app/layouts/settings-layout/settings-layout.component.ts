import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidenavComponent } from "../../shared/sidenav/sidenav.component";
@Component({
  selector: 'app-settings-layout',
  imports: [HeaderComponent, RouterOutlet, SidenavComponent],
  templateUrl: './settings-layout.component.html',
  styleUrl: './settings-layout.component.scss'
})

export class SettingsLayoutComponent {

}
