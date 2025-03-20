import { Component } from '@angular/core';
import { SidenavComponent } from "../../shared/sidenav/sidenav.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [SidenavComponent, HeaderComponent,RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

}
