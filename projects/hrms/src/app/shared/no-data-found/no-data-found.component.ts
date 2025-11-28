import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoDataFoundIconComponent } from "../../icons/no-data-found-icon/no-data-found-icon.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-no-data-found',
  imports: [CommonModule, NoDataFoundIconComponent, TranslateModule],
  templateUrl: './no-data-found.component.html',
  styleUrl: './no-data-found.component.scss'
})
export class NoDataFoundComponent {

}
