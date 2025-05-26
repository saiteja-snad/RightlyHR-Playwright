import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-module-information',
  imports: [CommonModule],
  templateUrl: './module-information.component.html',
  styleUrl: './module-information.component.scss'
})
export class ModuleInformationComponent {
  @Input() moduleInfo: string = '';
}
