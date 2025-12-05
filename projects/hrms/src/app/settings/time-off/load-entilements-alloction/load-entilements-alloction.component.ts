import { Component } from '@angular/core';
import { LoadentilledmentprogressbarComponent } from "../../../shared/loadentilledmentprogressbar/loadentilledmentprogressbar.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-load-entilements-alloction',
  imports: [LoadentilledmentprogressbarComponent, RouterModule],
  templateUrl: './load-entilements-alloction.component.html',
  styleUrl: './load-entilements-alloction.component.scss'
})
export class LoadEntilementsAlloctionComponent {

}
