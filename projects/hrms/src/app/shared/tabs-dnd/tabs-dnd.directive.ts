import { Directive, EffectRef, HostBinding, Input, OnDestroy, effect } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { MenuOrderService } from '../../services/theme-service/menu-order.service';

@Directive({
  selector: '[appTabsDnd]',
  standalone: true
})
export class TabsDndDirective<T extends Record<string, any>> implements OnDestroy {
  @Input({ required: true }) tabsDndKey!: string;
  @Input() tabsDndIdProp = 'tabId';
  @Input() tabsDndLabelProp = 'label';
  @Input() tabsDndRouteProp = 'route';

  @HostBinding('attr.data-tour') readonly tourKey = 'subtabs-dropzone';
  @HostBinding('attr.data-tour-module') get tourModule(): string | null {
    return this.tabsDndKey || null;
  }

  private items: T[] = [];
  @Input() set tabsDndItems(value: T[]) {
    this.items = value ?? [];
    this.applyOrderIfPossible();
  }

  private readonly effectRef: EffectRef;
  private readonly droppedSub: Subscription;

  constructor(
    private readonly dropList: CdkDropList<T[]>,
    private readonly menuOrderService: MenuOrderService
  ) {
    void this.menuOrderService.ensureLoaded();

    this.droppedSub = this.dropList.dropped.subscribe(event => this.onDrop(event));
    this.effectRef = effect(() => {
      const pref = this.menuOrderService.preferenceV2();
      if (pref) this.applyOrderIfPossible();
    });
  }

  ngOnDestroy(): void {
    this.droppedSub.unsubscribe();
    this.effectRef.destroy();
  }

  private applyOrderIfPossible(): void {
    if (!this.tabsDndKey) return;
    if (!this.items || this.items.length === 0) return;
    const reordered = this.menuOrderService.applySavedTabsOrder(
      this.tabsDndKey,
      this.items,
      (item) => String(item?.[this.tabsDndIdProp] ?? '')
    );

    if (reordered === this.items) return;
    this.items.splice(0, this.items.length, ...reordered);
  }

  private onDrop(event: CdkDragDrop<T[]>): void {
    if (!this.items || this.items.length === 0) return;
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.items, event.previousIndex, event.currentIndex);

    const employeeId = this.menuOrderService.getCurrentEmployeeId();
    if (!employeeId) return;

    const tabs = this.items.map(item => ({
      id: String(item?.[this.tabsDndIdProp] ?? ''),
      label: String(item?.[this.tabsDndLabelProp] ?? ''),
      route: String(item?.[this.tabsDndRouteProp] ?? '')
    }));
    this.menuOrderService.saveTabsModuleOrder(employeeId, this.tabsDndKey, tabs);
  }
}
