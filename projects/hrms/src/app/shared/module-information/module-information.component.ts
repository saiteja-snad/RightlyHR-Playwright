import { CommonModule } from '@angular/common';
import { Component, EventEmitter,Output, Input } from '@angular/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-module-information',
  imports: [CommonModule, TranslateModule, NgbPopoverModule],
  templateUrl: './module-information.component.html',
  styleUrl: './module-information.component.scss'
})

export class ModuleInformationComponent {
  @Input() moduleInfo: string = '';
   @Output() closePopover = new EventEmitter<void>();
   onClose() {
    this.closePopover.emit();
  }
}
