import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IRoles } from './permission.model';
import { filter, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { permissionsData } from './permissionsdata';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsHeaderComponent } from '../../../shared/settings-tabs/settings-header/settings-header.component';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

export interface PermissionRow {
  fields: string;
  View: boolean;
  Update: boolean;
  Create: boolean;
  Delete: boolean;
}

export interface RowDisabled {
  View: boolean;
  Update: boolean;
  Create: boolean;
  Delete: boolean;
}

export type FlatItem =
  | { kind: 'header'; title: string; rows: PermissionRow[]; disableFn: string }
  | { kind: 'row'; row: PermissionRow; disableFn: string; disabled: RowDisabled };

export interface HeaderState {
  checked: boolean;
  indeterminate: boolean;
}

@Component({
  selector: 'app-permissions',
  imports: [CommonModule, FormsModule, AutoCompleteModule, DataLoaderContentComponent, TranslateModule, NgbPopoverModule, SettingsHeaderComponent, ScrollingModule
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsComponent implements OnInit, OnDestroy {
  moduleinfo = '';
  roleId!: string;
  isSaveButtonEnabled = false;
  roles: IRoles[] = [];

  /** Single source of truth — never reassign individual row props without going through this array */
  permissions!: PermissionRow[];

  /** Flat list for virtual scroll — rebuilt in buildFlatList() */
  flatList: FlatItem[] = [];

  /** section-title → PermissionRow[] — always in sync with `permissions` */
  headerRowsMap = new Map<string, PermissionRow[]>();

  /** Checked / indeterminate state per section header */
  headerState: Record<string, HeaderState> = {};

  roleToFilter: any = null;
  filteredRole: any[] = [];
  searchText = '';
  currentSearchMatches: number[] = [];
  currentMatchIndex: number = -1;
  dataLoad = false;
  readonly ITEM_HEIGHT = 42;

  destroy$ = new Subject<boolean>();
  private selectionChangeTimer: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('stagingLoadingModal') stagingLoadingModal: any;
  @ViewChild('resetLoadingModal') resetLoadingModal: any;
  @ViewChild('viewport') viewport?: CdkVirtualScrollViewport;

  constructor(private http: HttpService, private modalService: NgbModal, private modal: OpenModalService, public rbac: RbacService, public readonly router: Router, private cdr: ChangeDetectorRef, private ngZone: NgZone, private sanitizer: DomSanitizer
  ) { }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.dataLoad = true;
    setTimeout(() => {
      this.permissions = JSON.parse(JSON.stringify(permissionsData));
      this.buildFlatList();
      this.getAllroles();
      this.dataLoad = false;
      this.cdr.markForCheck();
    }, 0);

    this.updateModuleInfo();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateModuleInfo());
  }

  private clearSearchTimer(): void {
    if (this.selectionChangeTimer) {
      clearTimeout(this.selectionChangeTimer);
      this.selectionChangeTimer = null;
    }
  }

  onSearchTextChange(): void {
    const query = this.searchText?.trim().toLowerCase();
    if (!query) {
      this.currentSearchMatches = [];
      this.currentMatchIndex = -1;
      this.cdr.markForCheck();
      this.clearSearchTimer();
      return;
    }

    this.currentSearchMatches = this.findAllPermissionFieldMatches(query);
    this.currentMatchIndex = this.currentSearchMatches.length > 0 ? 0 : -1;
    this.cdr.markForCheck();

    this.clearSearchTimer();
    this.selectionChangeTimer = setTimeout(() => {
      if (this.currentMatchIndex >= 0 && this.currentMatchIndex < this.currentSearchMatches.length) {
        this.scrollToIndex(this.currentSearchMatches[this.currentMatchIndex]);
      }
    }, 250);
  }

  onSearchEnter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.searchText.trim()) return;

    if (this.currentSearchMatches.length === 0) {
      this.updateSearchMatches();
    } else {
      this.currentMatchIndex = (this.currentMatchIndex + 1) % this.currentSearchMatches.length;
    }

    if (this.currentMatchIndex >= 0 && this.currentMatchIndex < this.currentSearchMatches.length) {
      this.scrollToIndex(this.currentSearchMatches[this.currentMatchIndex]);
      this.cdr.markForCheck();
    }
  }

  nextMatch(): void {
    if (this.currentSearchMatches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.currentSearchMatches.length;
    this.scrollToIndex(this.currentSearchMatches[this.currentMatchIndex]);
    this.cdr.markForCheck();
  }

  previousMatch(): void {
    if (this.currentSearchMatches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.currentSearchMatches.length) % this.currentSearchMatches.length;
    this.scrollToIndex(this.currentSearchMatches[this.currentMatchIndex]);
    this.cdr.markForCheck();
  }

  private updateSearchMatches(): void {
    this.refreshSearchMatches(true);
  }

  private refreshSearchMatches(autoScroll = false): void {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      this.currentSearchMatches = [];
      this.currentMatchIndex = -1;
      return;
    }

    this.currentSearchMatches = this.findAllPermissionFieldMatches(query);
    this.currentMatchIndex = this.currentSearchMatches.length > 0 ? 0 : -1;

    if (autoScroll && this.currentMatchIndex >= 0) {
      this.scrollToIndex(this.currentSearchMatches[this.currentMatchIndex]);
    }

    this.cdr.markForCheck();
  }

  scrollToSearchMatch(): void {
    const query = this.searchText.trim().toLowerCase();
    if (!query) return;

    const fieldIndex = this.findPermissionFieldIndex(query);
    if (fieldIndex !== -1) {
      this.scrollToIndex(fieldIndex);
    }
  }

  private findAllPermissionFieldMatches(query: string): number[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const getScore = (text: string): number => {
      const lower = text.toLowerCase();
      if (lower === normalizedQuery) return 100;
      if (lower.startsWith(normalizedQuery + ' ')) return 90;
      if (lower.endsWith(' ' + normalizedQuery)) return 85;
      if (new RegExp(`\\b${this.escapeRegExp(normalizedQuery)}\\b`, 'i').test(lower)) return 80;
      if (lower.includes(normalizedQuery)) return 70;
      return 0;
    };

    const matches: Array<{ index: number; score: number }> = [];

    this.flatList.forEach((item, index) => {
      const text = item.kind === 'row' ? item.row.fields : item.title;
      const score = getScore(text);
      if (score > 0) {
        matches.push({ index, score });
      }
    });

    return matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    }).map(m => m.index);
  }

  private findPermissionFieldIndex(query: string): number {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return -1;

    const getScore = (text: string): number => {
      const lower = text.toLowerCase();
      if (lower === normalizedQuery) return 100;
      if (lower.startsWith(normalizedQuery + ' ')) return 90;
      if (lower.endsWith(' ' + normalizedQuery)) return 85;
      if (new RegExp(`\\b${this.escapeRegExp(normalizedQuery)}\\b`, 'i').test(lower)) return 80;
      if (lower.includes(normalizedQuery)) return 70;
      return 0;
    };

    let bestIndex = -1;
    let bestScore = 0;

    this.flatList.forEach((item, index) => {
      const text = item.kind === 'row' ? item.row.fields : item.title;
      const score = getScore(text);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private scrollToIndex(fieldIndex: number): void {
    if (!this.viewport) return;

    try {
      this.ngZone.run(() => {
        this.viewport!.checkViewportSize();
        this.viewport!.scrollToIndex(fieldIndex, 'auto');
        this.cdr.markForCheck();
      });
    } catch {
      try {
        const el = (this.viewport as any).elementRef?.nativeElement as HTMLElement;
        if (el) el.scrollTop = fieldIndex * this.ITEM_HEIGHT;
      } catch {
        // ignore fallback failure
      }
    }
  }

  getHighlightedFieldText(text: string, active = false): SafeHtml {
    const query = this.searchText?.trim();
    if (!query) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
    }

    const escapedText = this.escapeHtml(text);
    const escapedQuery = this.escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const className = active ? 'permission-highlight permission-highlight-active' : 'permission-highlight';
    const highlighted = escapedText.replace(regex, `<span class="${className}">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  isActiveSearchMatch(index: number): boolean {
    return this.currentMatchIndex >= 0 && this.currentSearchMatches[this.currentMatchIndex] === index;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  ngOnDestroy(): void {
    if (this.selectionChangeTimer) clearTimeout(this.selectionChangeTimer);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  // ── FlatList construction ────────────────────────────────────────────────────

  /**
   * Full rebuild: clears headerRowsMap, populates it from `permissions`,
   * then produces a new flatList.  Call after any structural change or when
   * the role changes.
   */
  buildFlatList(): void {
    const permMap = new Map<string, PermissionRow>();
    this.permissions.forEach(p => permMap.set(p.fields, p));

    // Build a lookup of existing flat items to REUSE same object references
    const existingRowItems = new Map<string, Extract<FlatItem, { kind: 'row' }>>();
    const existingHeaderItems = new Map<string, Extract<FlatItem, { kind: 'header' }>>();
    for (const item of this.flatList) {
      if (item.kind === 'row') existingRowItems.set(item.row.fields, item);
      else existingHeaderItems.set(item.title, item);
    }

    const used = new Set<string>();
    this.headerRowsMap.clear();
    const list: FlatItem[] = [];

    for (const def of SECTION_DEFINITIONS) {
      const rows = def.fieldNames
        .map(f => permMap.get(f))
        .filter((r): r is PermissionRow => !!r && !used.has(r.fields))
        .map(r => { used.add(r.fields); return r; });

      if (rows.length === 0) continue;

      this.headerRowsMap.set(def.title, rows);

      // Reuse existing header item if present
      const existingHeader = existingHeaderItems.get(def.title);
      if (existingHeader) {
        existingHeader.rows = rows;
        list.push(existingHeader);
      } else {
        list.push({ kind: 'header', title: def.title, rows, disableFn: def.disableFn });
      }

      for (const row of rows) {
        // Reuse existing row item — keeps same object reference for virtual scroll trackBy
        const existingRow = existingRowItems.get(row.fields);
        if (existingRow) {
          existingRow.row = row;
          // Update disabled in-place
          const d = this.computeRowDisabled(def.disableFn, row);
          existingRow.disabled.View = d.View;
          existingRow.disabled.Update = d.Update;
          existingRow.disabled.Create = d.Create;
          existingRow.disabled.Delete = d.Delete;
          list.push(existingRow);
        } else {
          list.push({
            kind: 'row',
            row,
            disableFn: def.disableFn,
            disabled: this.computeRowDisabled(def.disableFn, row),
          });
        }
      }
    }

    this.flatList = list;
    this.recomputeHeaderState();
    this.refreshSearchMatches(false);
  }

  /**
   * Mutates disabled in-place so virtual scroll does NOT get a new array
   * reference (which would cause it to re-render all visible items and lose
   * checkbox state for rows outside the viewport).
   */
  private refreshDisabledState(): void {
    for (const item of this.flatList) {
      if (item.kind !== 'row') continue;
      const d = this.computeRowDisabled(item.disableFn, item.row);
      item.disabled.View = d.View;
      item.disabled.Update = d.Update;
      item.disabled.Create = d.Create;
      item.disabled.Delete = d.Delete;
    }
    this.cdr.markForCheck();
  }

  private computeRowDisabled(disableFn: string, row: PermissionRow): RowDisabled {
    const fn = (this as any)[disableFn];
    if (!fn) return { View: false, Update: false, Create: false, Delete: false };
    return {
      View: !!fn.call(this, row, 'View'),
      Update: !!fn.call(this, row, 'Update'),
      Create: !!fn.call(this, row, 'Create'),
      Delete: !!fn.call(this, row, 'Delete'),
    };
  }

  // ── Header state ─────────────────────────────────────────────────────────────

  recomputeHeaderState(): void {
    const next: Record<string, HeaderState> = {};
    for (const [title, rows] of this.headerRowsMap) {
      const anySelected = rows.some(p => p.View || p.Create || p.Update || p.Delete);
      const allSelected = rows.length > 0 && rows.every(p => p.View || p.Create || p.Update || p.Delete);
      next[title] = { checked: allSelected, indeterminate: anySelected && !allSelected };
    }
    this.headerState = next;
    this.cdr.markForCheck();
  }

  // ── Template helpers ──────────────────────────────────────────────────────────

  trackByItem(_: number, item: FlatItem): string {
    return item.kind === 'header' ? `h_${item.title}` : `r_${item.row.fields}`;
  }

  asHeader(item: FlatItem) { return item as Extract<FlatItem, { kind: 'header' }>; }
  asRow(item: FlatItem) { return item as Extract<FlatItem, { kind: 'row' }>; }

  // ── Select-all ────────────────────────────────────────────────────────────────

  /**
   * FIX: only touches rows that belong to THIS section's headerRowsMap entry.
   * headerRowsMap is always populated from `permissions` during buildFlatList,
   * so there is no cross-section contamination.
   */
  toggleSelectAllByTitle(title: string, checked: boolean, disableFn: string): void {
    const rows = this.headerRowsMap.get(title);
    if (!rows?.length) return;

    const fn = (this as any)[disableFn]?.bind(this);

    for (const per of rows) {
      for (const action of (['View', 'Update', 'Create', 'Delete'] as const)) {
        // Skip disabled cells
        if (fn && fn(per, action)) continue;
        per[action] = checked;
      }

      // Business rules
      if (checked) {
        // If any write permission is on, View must also be on
        if (per.Create || per.Update || per.Delete) {
          if (!fn || !fn(per, 'View')) per.View = true;
        }
      } else {
        // If View is off, all write permissions must be off
        if (!per.View) per.Update = per.Create = per.Delete = false;
      }
    }

    this.isSaveButtonEnabled = this.permissions.some(
      p => p.View || p.Create || p.Update || p.Delete
    );

    // Refresh disabled cells first, THEN recompute header ticks
    this.refreshDisabledState();
    this.recomputeHeaderState();
  }

  // ── Role / permissions loading ────────────────────────────────────────────────

  getAllroles(): void {
    this.http.getData('RightlyHrRole')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => { this.roles = (data as IRoles[]).sort((a, b) => a.name.localeCompare(b.name)); this.cdr.markForCheck(); },
        error: (e) => console.error(e),
      });
  }

  filterRoles(event: any): void {
    const q = event.query.toLowerCase();
    this.filteredRole = this.roles
      .filter((r: any) => r.name.toLowerCase().startsWith(q))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  onRoleSelect(event: any): void {
    const id = event?.value?.id;
    if (id) this.loadPermissionsForRole(id);
    // Disabled-state refresh happens inside applyServerPermissions → refreshDisabledState
  }

  /**
   * Called when the model changes (user types or clears the autocomplete).
   * If there is no longer a valid role selected, reset all checkboxes.
   */
  changePermissions(): void {
    this.clearSearchTimer();
    if (!this.roleToFilter?.id) {
      this.permissions.forEach(p => {
        p.View = p.Create = p.Update = p.Delete = false;
      });
      this.isSaveButtonEnabled = false;
      this.refreshDisabledState();
      this.recomputeHeaderState();
    }
  }

  private loadPermissionsForRole(id: string): void {
    this.clearSearchTimer();
    this.dataLoad = true;
    this.roleId = id;
    this.cdr.markForCheck();

    this.http
      .getData(`RightlyHrRoleClaims/getRoleClaimsbyroleId/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => this.applyServerPermissions(data),
        error: () => { this.dataLoad = false; this.applyServerPermissions([]); },
        complete: () => { this.dataLoad = false; this.cdr.markForCheck(); },
      });
  }

  private applyServerPermissions(data: any[]): void {
    // Reset all first
    this.permissions.forEach(p => {
      p.View = p.Create = p.Update = p.Delete = false;
    });

    if (data?.length) {
      const map = new Map<string, PermissionRow>();
      this.permissions.forEach(p => map.set(p.fields, p));

      for (const claim of data) {
        const perm = map.get(claim.claimType);
        if (!perm) continue;
        const v: string = claim.claimValue.toLowerCase();
        if (v.endsWith('.view')) perm.View = true;
        if (v.endsWith('.create')) perm.Create = true;
        if (v.endsWith('.update')) perm.Update = true;
        if (v.endsWith('.delete')) perm.Delete = true;
      }

      // Ensure View is set whenever any write permission exists
      for (const perm of this.permissions) {
        if ((perm.Create || perm.Update || perm.Delete) && !perm.View) {
          perm.View = true;
        }
      }

      this.isSaveButtonEnabled = true;
    } else {
      this.isSaveButtonEnabled = false;
    }

    // IMPORTANT: rebuild the flat list so headerRowsMap reflects the latest
    // `permissions` values, then refresh disabled state.
    // This is the key fix for the "permissions loading" issue — previously
    // only refreshDisabledState() was called, which left stale row references
    // in headerRowsMap if buildFlatList had never run for this role.
    this.buildFlatList();
  }

  onCheckboxChange(permission: PermissionRow, action: string, checked: boolean): void {
    (permission as unknown as Record<string, boolean>)[action] = checked;

    if (action === 'View' && !checked) {
      permission.Update = permission.Create = permission.Delete = false;
    } else if (action !== 'View' && checked) {
      permission.View = true;
    }

    this.isSaveButtonEnabled = this.permissions.some(
      p => p.View || p.Create || p.Update || p.Delete
    );

    for (const [title, rows] of this.headerRowsMap) {
      if (!rows.some(r => r.fields === permission.fields)) continue;
      const anySelected = rows.some(p => p.View || p.Create || p.Update || p.Delete);
      const allSelected = rows.every(p => p.View || p.Create || p.Update || p.Delete);
      this.headerState[title] = { checked: allSelected, indeterminate: anySelected && !allSelected };
      break;
    }

    this.cdr.markForCheck();
  }

  // ── Save / reset ──────────────────────────────────────────────────────────────

  permissionsCreate(): void {
    this.modalService.open(this.stagingLoadingModal, { centered: true });
    this.http
      .postdata('RightlyHrRoleClaims/rolePermissions', this.preparePayload(this.roleId))
      .subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.modal.openSuccessModal('Permissions updated successfully');
        },
        error: () => {
          this.modalService.dismissAll();
          this.modal.openErrorModal('Failed to update permissions!');
        },
      });
  }

  private preparePayload(roleId: string): any[] {
    const claims: any[] = [];
    for (const p of this.permissions) {
      if (p.View) claims.push({ claimType: p.fields, claimValue: `${p.fields}.view`, roleId });
      if (p.Create) claims.push({ claimType: p.fields, claimValue: `${p.fields}.create`, roleId });
      if (p.Update) claims.push({ claimType: p.fields, claimValue: `${p.fields}.update`, roleId });
      if (p.Delete) claims.push({ claimType: p.fields, claimValue: `${p.fields}.delete`, roleId });
    }
    return claims;
  }

  openModal(content: any): void {
    this.modalService.open(content, { centered: true });
  }

  reset(): void {
    this.modalService.dismissAll();
    this.modalService.open(this.resetLoadingModal, { centered: true });

    if (this.roleToFilter?.id) {
      this.http
        .getData(`RightlyHrRoleClaims/getRoleClaimsbyroleId/${this.roleToFilter.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.applyServerPermissions(data);
            this.modalService.dismissAll();
            setTimeout(() => this.modal.openSuccessModal('Permissions reset successfully'), 500);
          },
          error: () => {
            this.permissions.forEach(p => {
              p.View = p.Create = p.Update = p.Delete = false;
            });
            this.isSaveButtonEnabled = false;
            this.buildFlatList(); // keep list in sync
            this.modalService.dismissAll();
          },
        });
    } else {
      setTimeout(() => {
        this.permissions = JSON.parse(JSON.stringify(permissionsData));
        this.buildFlatList();
        this.roleToFilter = null;
        this.isSaveButtonEnabled = false;
        this.modalService.dismissAll();
        this.cdr.markForCheck();
        setTimeout(() => this.modal.openSuccessModal('Permissions reset successfully'), 500);
      }, 0);
    }
  }

  updateModuleInfo(): void {
    this.moduleinfo = this.router.url.includes('/settings/roles-permissions/permissions')
      ? MODULE_INFOS.SETTINGS_ROLES_PERMISSION_MODULE_INFO
      : '';
  }


  // ── Disable functions ─────────────────────────────────────────────────────────

  isDisabled(field: string, action: string): boolean {
    const viewOnly = [
      'Leave Allocation Tab', 'Leave Category Tab', 'Leave Category Pending Tab', 'Bulk Load Entitlements Tab', 'Flexible Leave Allocation Tab', 'Load Entitlements Tab',
      'Attendance Eligibility Criteria Tab', 'Comp Off Entitlement Tab', 'WFH Entitlement Tab', 'Initial Load Entitlements', 'Carry Forward Load Entitlements',
      'Permission Elgibility Tab', 'Attendance Regularization Eligibility Tab', 'Shifts Published Tab',
      'Policies Published Tab', 'Benefits Published Tab', 'Holidays Published Tab', 'Weekends Published Tab',
      'Expense Allowed Days', 'DST Published Tab', 'Leave Category Published Tab', 'Flexible Work Hours Allocation Tab', 'Work Hours Allocations Tab', 'Work Hours Allocation History Tab',
      'Desk Allocation - Inactive',
      'Desk Allocation - Create', 'Team Tickets Tab', 'My Tickets Tab',
      'Late Login Alert Configuration Tab',
      'Extra Hours Configuration Tab',
      'Flexible Work Hours Configuration Tab'


    ];
    return viewOnly.includes(field) && ['Create', 'Update', 'Delete'].includes(action);
  }

  isActionEnabled(field: string, action: string): boolean {
    const enabled = [
      'Document Tab', 'NoDue Clearance Tab', 'Leave Allocation Tab', 'Flexible Leave Allocation Tab',
      'Dynamic Forms Module', 'Desk Allocation - All', 'Manage Weekends Tab', 'Manage DST Tab',
      'My Info Job Details', 'My Info Previous Experience Details', 'My Info Certification Details',
      'My Info Onboarding Details', 'My Info Card Details', 'Employee Info Onboarding Details', 'Employee Info Job Details',
      'Employee Info Previous Experience Details', 'Employee Info Certification Details',
      'My Info Personal Approval History',
      'My Info Job Approval History','Rate Card Active Tab',
      'My Info Documents Approval History',
      'Employee Info Compensation Details', 'Draft Tab', 'Expenses Module', 'Job Shortlisted',
      'Letter Acknowledgment Configuration', 'Ats Configuration Module', 'Closed Jobs', 'Inactive Jobs', 'Active Jobs', 'Active Applicants', 'Screening Completed Applicants',
      'Checklist Verification', 'Checklist Submissions', 'All Tickets Tab', 'Open Tickets Tab', 'Await On User Tickets Tab', , 'Rejected Tickets Tab'
    ];
    return enabled.includes(field) && ['Create', 'Update', 'Delete'].includes(action);
  }

  isFieldDisabled(field: string, permission: string): boolean {
    if (field === 'Asset Management - Create') return permission !== 'View';
    if (['Asset Management - All', 'Asset Management - Available'].includes(field)) return permission !== 'View';
    if (['Asset Management - Under Maintenance', 'Asset Management - Inactive', 'Asset Management - Allocated'].includes(field))
      return !['View'].includes(permission);
    return false;
  }

  isSidebarCheckboxDisabled = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Update' || action === 'Delete') return true;
    if (action === 'Create') return !this.isActionEnabled(per.fields, 'Create') || !this.roleToFilter?.id;
    return false;
  };

  isapplicationscreeningfunction = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    if (!this.roleToFilter?.id) return true;

    const createAllowedFields = ['Active Jobs', 'Job Shortlisted'];

    // View always blocked if no role
    if (action === 'View') return false;

    // Update logic
    if (action === 'Update')
      return !this.isActionEnabled(per.fields, 'Update');

    // Create only for specific fields
    if (action === 'Create')
      return !createAllowedFields.includes(per.fields);

    // Delete allowed for all (change if needed)
    if (action === 'Delete')
      return true;

    return false;
  };

  isHelpDeskModuleCheckboxDisabled = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    if (!this.roleToFilter?.id) return true;

    // Employee Helpdesk Queries Tab & My Tickets Tab → View + Create enabled
    if (
      per.fields === 'Employee Helpdesk Queries Tab' ||
      per.fields === 'My Tickets Tab'
    ) {
      if (action === 'View') return false;
      if (action === 'Create') return false;
      return true; // Update & Delete disabled
    }
    if (per.fields === 'Team Tickets Tab') {
      if (action === 'View') return false;
    }

    // Support Helpdesk Queries Tab → View + Update enabled
    if (per.fields === 'Support Helpdesk Queries Tab') {
      if (action === 'View') return false;
      if (action === 'Update') return false;
      return true; // Create & Delete disabled
    }

    return true;
  };

  isCheckboxDisabledforupdateandview = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Create' || action === 'Delete') return true;
    if (action === 'Update') return !this.isActionEnabled(per.fields, 'Update') || !this.roleToFilter?.id;
    return false;
  };

  isonlyviewanddeletefunction = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Create' || action === 'Update') return true;
    if (action === 'Delete') return !this.isActionEnabled(per.fields, 'Delete') || !this.roleToFilter?.id;
    return false;
  };
 israteCardCheckboxDisabled = (
  per: PermissionRow,
  action: 'View' | 'Update' | 'Create' | 'Delete'
) => {

  if (!this.roleToFilter?.id) return true;

  const isActive = per.fields === 'Rate Card Active Tab';
  const isInactive = per.fields === 'Rate Card In-active Tab';

  // Active tab → allow everything
  if (isActive) return false;

  // In-active tab → only View + Update allowed
  if (isInactive) {
    if (action === 'View') return false;
    if (action === 'Update') return false;
    return true; // Create + Delete disabled
  }

  return false;
};
  isonlyviewfunction = (_: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') =>
    action === 'View' ? !this.roleToFilter?.id : true;

  isonlycreatfunction = (_: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') =>
    action === 'Create' ? true : !this.roleToFilter?.id;

  isemployeeCheckboxDisabled = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Update') return !this.roleToFilter?.id || !['NoDue Clearance Tab'].includes(per.fields);
    return !this.roleToFilter?.id || !['Document Tab', 'NoDue Clearance Tab'].includes(per.fields);
  };


  isSettingsEmployeeJobCheckboxDisabled = (_: PermissionRow, __: any) => !this.roleToFilter?.id;
  isSettingsProjectManagementConfig = (_: PermissionRow, __: any) => !this.roleToFilter?.id;
 isProjectManagementTabsCheckboxDisabled = (
  per: PermissionRow,
  action: 'View' | 'Update' | 'Create' | 'Delete'
) => {

  if (!this.roleToFilter?.id) return true;

  const viewOnlyFields = [
    'View Assigned Projects',
    'View All Projects'
  ];

  if (viewOnlyFields.includes(per.fields)) {
    return action !== 'View'; // Disable Update, Create, Delete
  }

  return false;
};

isProjectManagementClientsTabsCheckboxDisabled = (
  per: PermissionRow,
  action: 'View' | 'Update' | 'Create' | 'Delete'
) => {

  if (!this.roleToFilter?.id) return true;

  const viewOnlyFields = [
    'View Assigned Clients',
    'View All Clients'
  ];

  if (viewOnlyFields.includes(per.fields)) {
    return action !== 'View'; // Disable Update, Create, Delete
  }

  return false;
};
  isAttendanceLockingCheckboxDisabled = (_: PermissionRow, __: any) => !this.roleToFilter?.id;

  isSettingsManageShiftsCheckboxDisabled = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    if (!this.roleToFilter?.id) return true;

    // Enable Update for specific fields
    if (
      ['Leave Category Pending Tab', 'Initial Load Entitlements', 'Carry Forward Load Entitlements', 'Work Hours Allocation History Tab', 'Work Hours Allocations Tab']
        .includes(per.fields) &&
      action === 'Update'
    ) {
      return false;
    }

    // Disable only Delete for specific fields
    if (
      ['Leave Category Pending Tab', 'Initial Load Entitlements', 'Work Hours Allocations Tab', 'Work Hours Allocation History Tab',
        'Allocation History Tab',
        'Active Allocations Tab',
        'Allow Multi Date Range Tab',
        'WFH Allocation History Tab',
        'Allow Multi Date Range History Tab'
      ]
        .includes(per.fields) &&
      action === 'Delete'
    ) {
      return true;
    }

    if (action === 'Delete' || action === 'Update') {
      return this.isDisabled(per.fields, 'Update');
    }

    return false;
  };



  isDynamicFormsDisabled = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {
    if (
      ['Draft Forms', 'Inactive Forms', 'Active Forms', 'Attendance Published Tab', 'Timesheet Locking Published Tab'].includes(per.fields) &&
      action === 'Create'
    ) {
      return true;
    }
    if (
      ['Inactive Forms', 'Attendance Published Tab', 'Timesheet Locking Published Tab'].includes(per.fields) &&
      action === 'Delete'
    ) {
      return true;
    }

    if (action === 'Delete') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Delete');
    }

    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }

    if (action === 'Create') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Create');
    }

    return !this.roleToFilter?.id;
  };


  iscardmangementFormsDisabled = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    if (
      ['Cards Hold', 'Cards Expired'].includes(per.fields) &&
      action === 'Create'
    ) {
      return true;
    }
    if (
      ['Cards Expired', 'Cards Allocated', 'Cards Hold'].includes(per.fields) &&
      action === 'Delete'
    ) {
      return true;
    }
    if (
      ['Cards Expired'].includes(per.fields) &&
      action === 'Update'
    ) {
      return true;
    }
    if (action === 'Delete') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Delete');
    }

    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }

    if (action === 'Create') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Create');
    }

    return !this.roleToFilter?.id;
  };

  isSettingsExpenseConfigurationCheckboxDisabled = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    // Allow Update
    if (
      ['Expense Allowed Days', 'Initial Load Entitlements', 'Carry Forward Load Entitlements', 'Permission Elgibility Tab',
        'WFH Entitlement Tab', 'Comp Off Entitlement Tab', 'Attendance Regularization Eligibility Tab',
        'Late Login Alert Configuration Tab',
        'Extra Hours Configuration Tab',
        'Flexible Work Hours Configuration Tab'
      ]
        .includes(per.fields) &&
      action === 'Update'
    ) {
      return false;
    }

    if (action === 'Delete') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Delete');
    }

    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }

    if (action === 'Create') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Create');
    }

    return !this.roleToFilter?.id;
  };

  isSettingsTimeOfffunction = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    // Allow Create for specific fields
    if (
      ['Leave Allocation Tab', 'Flexible Leave Allocation Tab'].includes(per.fields) &&
      action === 'Create'
    ) {
      return !this.roleToFilter?.id;
    }

    if (action === 'Delete') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Delete');
    }

    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }

    if (action === 'Create') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Create');
    }

    return !this.roleToFilter?.id;
  };

  isPmsModuleCheckboxDisabled = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    const fullAccessFields = [
      'KRA',
      'KPI',
      'Assign KRA KPI'
    ];

    // Enable all actions for these 3 fields
    if (fullAccessFields.includes(per.fields)) {
      return !this.roleToFilter?.id;
    }

    // Remaining fields → View only
    return action === 'View'
      ? !this.roleToFilter?.id
      : true;
  };

  isPmsConfigurationCheckboxDisabled = (_: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') =>
    action === 'View' ? !this.roleToFilter?.id : true;

  isAssetCheckboxDisabled = (_: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') =>
    action === 'View' ? !this.roleToFilter?.id : true;

  isOrgHierarchyActionDisabled = this.isAssetCheckboxDisabled;
  isdekActionDisabled = this.isAssetCheckboxDisabled;
  isdeskallActionDisabled = this.isAssetCheckboxDisabled;
  isdeskavilableActionDisabled = this.isAssetCheckboxDisabled;
  isdeskallocationActionDisabled = this.isAssetCheckboxDisabled;
  isdeskundermaintanceDisabled = this.isAssetCheckboxDisabled;
  isdeskinactiveDisabled = this.isAssetCheckboxDisabled;

  isEmployeeInfoJobActionDisabled = (
    per: PermissionRow,
    action: 'View' | 'Update' | 'Create' | 'Delete'
  ) => {

    if (action === 'View') return !this.roleToFilter?.id;

    const upd = [
      'Employee Info Asset Details',
      'Employee Info Desk Details',
      'Employee Info Pre-Onboarding Details',
      'Employee Info Offboarding Details',
      'Employee Info Separation Request Details',
      'Employee Info No Due Clearance Details',
      'Employee Info Probation Details',
      'Employee Info Onboarding Request Details',
      'No Due Form',
      'Employee Info Separation Request',
      'Employee Info Contract Conversion Request',
    ];

    const cre = [...upd, 'Employee Info Onboarding Details'];
    const del = [...cre, 'Employee Info Job Details'];

    if (action === 'Update')
      return !this.roleToFilter?.id || upd.includes(per.fields);

    if (action === 'Create') {

      // Enable Create for Contract Conversion Request
      if (per.fields === 'Employee Info Contract Conversion Request') {
        return !this.roleToFilter?.id;
      }

      // Disable Create for Documents Verification
      if (per.fields === 'Employee Info Documents Verification') {
        return true;
      }

      return !this.roleToFilter?.id || cre.includes(per.fields);
    }

    if (action === 'Delete')
      return !this.roleToFilter?.id || del.includes(per.fields);

    return false;
  };

  isEmployeeInfoPersonalActionDisabled = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (per.fields === 'Employee My Skills') {
      if (['Update'].includes(action)) return true;
    }
    if (action === 'View' || action === 'Update') return !this.roleToFilter?.id;
    const a = [
      'Employee Info Education Details', 'Employee Info Identity Details',
      'Employee Info Family Details', 'Employee Info Bank Details', 'Employee Info Visa Details',
    ];
    if (action === 'Create') return !this.roleToFilter?.id || !a.includes(per.fields);
    return !this.roleToFilter?.id || !([...a, 'Employee Info Documents Verification']).includes(per.fields);

  };

  isMyInfoPersonalActionDisabled = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (per.fields === 'My Skills') {
      if (['Update'].includes(action)) return true;
      if (action === 'Delete' || action === 'Create') return false;
    }
    if (action === 'View' || action === 'Update') return !this.roleToFilter?.id;
    const a = ['My Info Education Details', 'My Info Identity Details', 'My Info Family Details', 'My Info Bank Details', 'My Info Visa Details'];
    return !this.roleToFilter?.id || !a.includes(per.fields);
  };

  isMyInfoJobActionDisabled = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'Update') return !this.roleToFilter?.id || !['My Info Previous Experience Details', 'My Info Certification Details'].includes(per.fields);
    if (action === 'View') return !this.roleToFilter?.id;
    return !this.roleToFilter?.id || !['My Info Previous Experience Details', 'My Info Certification Details'].includes(per.fields);

  };

  isemployeeinfoteamActionDisabled = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Create' || action === 'Delete') return true;
    return !this.roleToFilter?.id || !['Employee Info Change TM Button', 'Employee Info Change RM Button'].includes(per.fields);
  };

  isChecklistCheckboxDisabled = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Update') return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    if (action === 'Create') return !this.roleToFilter?.id;
    if (action === 'Delete') return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Delete');
    return false;
  };

  issubContractor = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Create') return !this.roleToFilter?.id ||
      !['Active ATS Subcontractor', 'Subcontractor Contact Information', 'Subcontractor MSA'].includes(per.fields);
    if (action === 'Update') return !this.roleToFilter?.id ||
      !['Active ATS Subcontractor', 'Inactive ATS Subcontractor', 'Subcontractor MSA',
        'Subcontractor Onboard Requests', 'Subcontractor Contact Information', 'Authorized ATS Subcontractor'].includes(per.fields);
    if (action === 'Delete') return !this.roleToFilter?.id ||
      !['Active ATS Subcontractor', 'Subcontractor Contact Information'].includes(per.fields);
    return false;
  };

  isonlyviewatsfunction = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Update') return !this.roleToFilter?.id ||
      !['ATS Consultants Experience', 'ATS Consultants References', 'ATS Consultants Certifications', 'ATS Consultants Documents'].includes(per.fields);
    return !this.roleToFilter?.id ||
      !['ATS Consultants Experience', 'ATS Consultants References', 'ATS Consultants Certifications',
        'ATS Consultants Skills', 'ATS Consultants Documents'].includes(per.fields);
  };

  isonlyatsclientfunction = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View' || action === 'Update') return !this.roleToFilter?.id;
    if (action === 'Create') return !this.roleToFilter?.id ||
      !['Active ATS Clients', 'ATS Clients Jobs', 'ATS Clients Contacts Info'].includes(per.fields);
    if (action === 'Delete') return !this.roleToFilter?.id || !['ATS Clients Contacts Info'].includes(per.fields);
    return false;
  };

  isonlyatsallconsultantsview = (per: PermissionRow, action: 'View' | 'Update' | 'Create' | 'Delete') => {
    if (action === 'View') return !this.roleToFilter?.id;
    if (action === 'Update') return !this.roleToFilter?.id ||
      !['Draft Consultants', 'On Hold Consultants', 'Attention Required Consultants',
        'Internal Placed Consultants', 'Internal Available Consultants',
        'Sub Contractor Placed Consultants', 'Sub Contractor Available Consultants'].includes(per.fields);
    if (action === 'Create') return !this.roleToFilter?.id || !['Sub Contractor Consultants', 'Internal Consultants'].includes(per.fields);
    if (action === 'Delete') return !this.roleToFilter?.id || !['Draft Consultants'].includes(per.fields);
    return false;
  };
}

// ── Section definitions ────────────────────────────────────────────────────────
interface SectionDef { title: string; fieldNames: string[]; disableFn: string; }
export const SECTION_DEFINITIONS: SectionDef[] = [
  {
    title: 'Settings Sidebar',
    disableFn: 'isSidebarCheckboxDisabled',
    fieldNames: [
      'Roles',
      'Employee Fields Module',
      'Settings Timeoff Module',
      'Assets Management Configuration Module',
      'Dynamic Forms Module',
      'Attendance Configuration Module',
      'Project Management Configuration Module',
      'Locking System Configuration Module',
      'Rate Card Configuration Module',
      'Recruitment Configuration Module',
      'Helpdesk Configuration Module',
      'Employee Fields Config Update Module'
    ]
  }, {
    title: 'Dashboard Widgets',
    disableFn: 'isonlyviewfunction',
    fieldNames: [
      'Headcount by Department',
      'All Employees',
      'Consumed Leave Types',
      'Weekly Work Logs',
      'Headcount by Gender',
      'Upcoming Birthdays',
      'Team Members',
      'My Team Availability',
      'Upcoming Work Anniversaries',
      'Today Events',
      'Attendance Overview',
      'Sun View',
      'Organization Toggle',
      'Manager Toggle',
      'Headcount by Gender Select Department',
      'Organization Availability Select Department',
      'Attendance Status',
      'New Hires and Exits',
      'Locations and Shifts',
      'Approvals Overview',
      'Upcoming Actions',
      'Employee Experience Overview',
      'Headcount by Gender View Employee List'
    ]
  },
  { title: 'Rate Card Configuration Module', disableFn: 'israteCardCheckboxDisabled', fieldNames: ['Rate Card Active Tab', 'Rate Card In-active Tab'] },
  { title: 'Employee Fields', disableFn: 'isemployeeCheckboxDisabled', fieldNames: ['Personal Tab', 'Job Tab', 'Document Tab', 'Manage Shifts Tab', 'Manage Policies Tab', 'Manage Holidays Tab', 'Manage Weekends Tab', 'Manage DST Tab', 'Manage Benefits Tab', 'Expense Tab', 'NoDue Clearance Tab'] },
  { title: 'Employee Fields Config Update', disableFn: 'isemployeeCheckboxDisabled', fieldNames: ['Personal Config Update Tab', 'Job Config Update Tab', 'Document Config Update Tab'] },
  {
    title: 'Settings Employee Field Update Personal Tabs', disableFn: 'isSettingsEmployeeJobCheckboxDisabled', fieldNames: ['Basic Info','Contact Info','Addresses','Emergency Contacts','Identity Info','Bank Info','Academics']
  },
  {
    title: 'Settings Employee Field Update Job Tabs',
    disableFn: 'isSettingsEmployeeJobCheckboxDisabled',
    fieldNames: [
      'Certifications',
      'Employment History'
    ]
  },
  {
    title: 'Recruitment Configuration',
    disableFn: 'isSettingsEmployeeJobCheckboxDisabled',
    fieldNames: [
      'Recruitment Hiring Pipeline Config',
      'Recruitment Sources Config'
    ]
  }, {
    title: 'Recruitment Hiring Pipeline Config',
    disableFn: 'isSettingsEmployeeJobCheckboxDisabled',
    fieldNames: [
      'Interview Rounds Config',
      'On Hold Reason',
      'Reject Reason',
      'Dropoff Reason'
    ]
  },
  {
    title: 'Recruitment Sources Config',
    disableFn: 'isSettingsEmployeeJobCheckboxDisabled',
    fieldNames: [
      'Sources Config',
      'Source Type Config'
    ]
  },
  { title: 'Settings Employee Job Fields', disableFn: 'isSettingsEmployeeJobCheckboxDisabled', fieldNames: ['Job Role', 'Job Type', 'Probation Status', 'Background check Status', 'Notice Period', 'Frequency', 'Letter Acknoledgement', 'Paytype', 'Overtime Eligibility', 'Business Area', 'Termination Reason', 'Eligible For Rehire', 'Department', 'Team', 'Grade Details', 'Compensation Reason', 'Location', 'Sub Location', 'Pre Onboard Documents', 'Serving Period', 'Consultancy', 'Signature Authority', 'Settings Job Probation Details', 'Employee Benefits Configuration', 'Letter Acknowledgment Configuration'] },
  { title: 'Settings Employee Personal Fields', disableFn: 'isSettingsEmployeeJobCheckboxDisabled', fieldNames: ['Salutation', 'Status', 'Gender', 'Marital Status', 'Degree', 'Visa Type', 'Identity Type', 'Relationship', 'Bank Names', 'SkillSet'] },
  { title: 'Settings Manage Shifts Tab', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Shifts Pending Tab', 'Shifts Published Tab'] },
  { title: 'Settings Manage Benefits Tab', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Benefits Pending Tab', 'Benefits Published Tab'] },
  { title: 'Settings Manage Policies Tab', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Policies Pending Tab', 'Policies Published Tab'] },
  { title: 'Settings Manage Holidays Tab', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Holidays Pending Tab', 'Holidays Published Tab'] },
  { title: 'Settings Manage Weekends Tab', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Weekends Pending Tab', 'Weekends Published Tab'] },
  { title: 'Settings Expense Configuration Tab', disableFn: 'isSettingsExpenseConfigurationCheckboxDisabled', fieldNames: ['Expenes Configuartion', 'Expense Allowed Days', 'Expense Threshold Validation', 'Global Expense Configuration', 'Expense Checklist Configuration', 'Payment Mode Configurations'] },
  { title: 'Settings Manage DST Tab', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['DST Pending Tab', 'DST Published Tab'] },
  { title: 'Settings Time Off', disableFn: 'isSettingsTimeOfffunction', fieldNames: ['Leave Category Tab', 'Leave Allocation Tab', 'Flexible WFH Allocation Tab', 'Flexible Leave Allocation Tab', 'Attendance Eligibility Criteria Tab', 'Load Entitlements Tab', 'Bulk Load Entitlements Tab', 'Flexible Work Hours Allocation Tab'] },
  { title: 'Settings Time Off Leave Category Tabs', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Leave Category Pending Tab', 'Leave Category Published Tab'] },
  { title: 'Settings Time Off Bulk Load Entitlements Tab', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Initial Load Entitlements', 'Carry Forward Load Entitlements'] },
  {
    title: 'Settings Time Off Flexible WFH Allocation Tabs',
    disableFn: 'isSettingsManageShiftsCheckboxDisabled',
    fieldNames: [
      'Allocation History Tab',
      'Active Allocations Tab',
      'Allow Multi Date Range Tab',
      'WFH Allocation History Tab',
      'Allow Multi Date Range History Tab'
    ]
  },
  { title: 'Settings Time Off Flexible Work Hours Allocation Tabs', disableFn: 'isSettingsManageShiftsCheckboxDisabled', fieldNames: ['Work Hours Allocations Tab', 'Work Hours Allocation History Tab'] },
  {
    title: 'Settings TimeOff Attendance Eligibility Criteria', disableFn: 'isSettingsExpenseConfigurationCheckboxDisabled', fieldNames: ['Comp Off Entitlement Tab', 'WFH Entitlement Tab', 'Attendance Eligibility Permissions Tab', 'Permission Elgibility Tab', 'Attendance Regularization Tab', 'Attendance Regularization Eligibility Tab', 'Eligibility Global Permissions Tab', 'Late Login Alert Configuration Tab',
      'Extra Hours Configuration Tab',
      'Flexible Work Hours Configuration Tab']
  },
  { title: 'Settings Asset Configuration', disableFn: 'isSettingsEmployeeJobCheckboxDisabled', fieldNames: ['Vendor Details', 'Asset Category', 'Asset Sub Category'] },
  { title: 'Settings Dynamic Forms', disableFn: 'isDynamicFormsDisabled', fieldNames: ['Active Forms', 'Inactive Forms', 'Draft Forms', 'Form Settings'] },
  { title: 'Draft Form Mark As Active', disableFn: 'isonlyviewfunction', fieldNames: ['Mark As Active Action'] },

  { title: 'Expenses Type', disableFn: 'isSettingsProjectManagementConfig', fieldNames: ['Expenses Type', 'Expense Types Tab'] },

  {
    title: 'Side Bar Tabs',
    disableFn: 'isonlyviewfunction',
    fieldNames: [
      'Dashboard',
      'My Info',
      'Employees',
      'Events',
      'Time-Off',
      'Expenses',
      'Reports',
      'Policies',
      'Calendar',
      'Org Hierarchy',
      'PMS',
      'PMS Configurations',
      'Desk Allocation',
      'Asset Management',
      'Holidays',
      'Attendance',
      'Blood Bank',
      'Phone Book',
      'Contacts Directory',
      'Themes',
      'Project Management',
      'Skill Set Management',
      'Cards Management',
      'Clients',
      'Projects',
      'Time Sheet',
      'Pending Approvals Module',
      'Recruitment',
      'Job Openings',
      'Interview Review',
      'Recruitment Dashboard',
      'Recruiter Dashboard',
      'All Employees (Recruitment Dashboard)',
      'My Team (Recruitment Dashboard)',
      'All Employees (Recruiter Dashboard)',
      'My Team (Recruiter Dashboard)',
      'Help Desk',
      'IT Support'
    ]
  },
  { title: 'Expenses Module', disableFn: 'isSidebarCheckboxDisabled', fieldNames: ['Expenses Module', 'My Team (Expenses)', 'All Employees (Expenses)'] },
  { title: 'Expenses Module Tabs', disableFn: 'isCheckboxDisabledforupdateandview', fieldNames: ['Draft Tab', 'Approved Tab', 'Pending Tab', 'Processed Tab', 'Rejected Tab','Expense Clarifications Tab'] },
  { title: 'IT Support Module', disableFn: 'isHelpDeskModuleCheckboxDisabled', fieldNames: ['My Tickets Tab', 'Team Tickets Tab'] },
  { title: 'Team Tickets Tabs', disableFn: 'isCheckboxDisabledforupdateandview', fieldNames: ['All Tickets Tab', 'Open Tickets Tab', 'Await On User Tickets Tab', 'Solved Tickets Tab', 'Rejected Tickets Tab'] },
  { title: 'HelpDesk Module', disableFn: 'isHelpDeskModuleCheckboxDisabled', fieldNames: ['Employee Helpdesk Queries Tab', 'Support Helpdesk Queries Tab'] },
  {
    title: 'Helpdesk Support Tickets Tabs',
    disableFn: 'isonlyviewfunction',
    fieldNames: [
      'Helpdesk All Queries Tab',
      'Helpdesk Open Queries Tab',
      'Helpdesk Await On User Queries Tab',
      'Helpdesk Solved Queries Tab',
      'Helpdesk Rejected Queries Tab'
    ]
  },
  { title: 'Holidays Module', disableFn: 'isonlyviewfunction', fieldNames: ['Optional Holidays Tab', 'Public Holidays Tab'] },
  { title: 'Org Hierarchy Module', disableFn: 'isOrgHierarchyActionDisabled', fieldNames: ['Organization Hierarchy - HR', 'Organization Hierarchy - TM', 'Organization Hierarchy - Compensation', 'Organization Hierarchy - Download JPG', 'Organization Hierarchy - Download PDF'] },
  { title: 'Desk Allocation Module', disableFn: 'isdekActionDisabled', fieldNames: ['Desk Allocation - Create', 'Desk Allocation - All', 'Desk Allocation - Available', 'Desk Allocation - Allocated', 'Desk Allocation - Under Maintenance', 'Desk Allocation - Inactive', 'Desk Allocation - Waiting For Approval'] },
  { title: 'Cards Management Module', disableFn: 'iscardmangementFormsDisabled', fieldNames: ['Cards Allocated', 'Cards Available', 'Cards Expired', 'Cards Hold'] },
  // { title: 'Desk Allocation All Tab Actions', disableFn: 'isdeskallActionDisabled', fieldNames: ['Request for Allocation', 'Inactive desk', 'Schedule for Maintenance', 'Reallocate desk', 'Release Desk', 'Mark as Active', 'Mark as Available', 'View Desk Details'] },
  { title: 'Desk Allocation Available Tab Actions', disableFn: 'isdeskavilableActionDisabled', fieldNames: ['Available Request for Allocation', 'Available Inactive desk', 'Available Schedule for Maintenance', 'Available View Desk Details'] },
  { title: 'Desk Allocation Allocated Tab Actions', disableFn: 'isdeskallocationActionDisabled', fieldNames: ['Allocated Reallocate desk', 'Allocated Release Desk', 'Allocated View Desk Details'] },
  { title: 'Desk Allocation Under Maintenance Tab Actions', disableFn: 'isdeskundermaintanceDisabled', fieldNames: ['Under Maintenance Mark as Available', 'Under Maintenance View Desk Details'] },
  { title: 'Desk Allocation Inactive Tabs Actions', disableFn: 'isdeskinactiveDisabled', fieldNames: ['Inactive Mark as Available', 'Inactive View Desk Details'] },
  { title: 'Desk Allocation Waiting For Approval Tab Actions', disableFn: 'isonlyviewfunction', fieldNames: ['Waiting For Approval View Desk Details'] },
  { title: 'Time Off Tabs', disableFn: 'isonlyviewfunction', fieldNames: ['Time Off Module', 'WFH/On Duty Module', 'Remote Login Module', 'Comp Off Module', 'Permissions Module', 'Regularization Module', 'Extra Hours Module', 'On Behalf Of Module', 'On Behalf Of Approvals Module', 'Global Permissions Module', 'Pending Approvals Module'] },
  {
    title: 'Time Off Module Sub Tabs',
    disableFn: 'isonlyviewfunction',
    fieldNames: [
      'Waiting For Approval (Time Off)',
      'Approved (Time Off)',
      'Processed (Time Off)',
      'Rejected (Time Off)',
      'Request Leave Button',
      'Cancelled (Time Off)',
      'Entitlement Summary (Time Off)',
      'My Team (Time Off)',
      'All Employees (Time Off)',
      'Leave Summary (Time Off)',
      'My Team (Time Off Leave Summary)',
      'All Employees (Time Off Leave Summary)',
      'Leave Summary (Time Off) - Export',
      'My Team (KRA KPI)',
      'All Employees (KRA KPI)',

    ]
  }, { title: 'WFH Module Sub Tabs', disableFn: 'isonlyviewfunction', fieldNames: ['Waiting For Approval (WFH)', 'Approved (WFH)', 'Processed (WFH)', 'Cancel (WFH)', 'Rejected (WFH)', 'Request WFH Button', 'My Team (WFH)', 'All Employees (WFH)'] },
  {
    title: 'Remote Login Module Sub Tabs',
    disableFn: 'isonlyviewfunction',
    fieldNames: ['Request Remote Login Button','Waiting For Approval (Remote Login)','Approved (Remote Login)','Processed (Remote Login)','Rejected (Remote Login)','My Team (Remote Login)','All Employees (Remote Login)']
  }, { title: 'Comp Off Module Sub Tabs', disableFn: 'isonlyviewfunction', fieldNames: ['Waiting For Approval (Comp Off)', 'Approved (Comp Off)', 'Processed (Comp Off)', 'Rejected (Comp Off)', 'Request Comp Off Button', 'My Team (Comp Off)', 'All Employees (Comp Off)'] },
  { title: 'Permissions Module Sub Tabs', disableFn: 'isonlyviewfunction', fieldNames: ['Waiting For Approval (Permissions)', 'Processed (Permissions)', 'Cancel (Permissions)', 'Rejected (Permissions)', 'Request Permission Button', 'My Team (Permissions)', 'All Employees (Permissions)'] },
  { title: 'Regularization Module Sub Tabs', disableFn: 'isonlyviewfunction', fieldNames: ['Waiting For Approval (Regularization)', 'Approved (Regularization)', 'Processed (Regularization)', 'Rejected (Regularization)', 'My Team (Regularization)', 'All Employees (Regularization)'] },
  {title: 'Extra Hours Module Sub Tabs',disableFn: 'isonlyviewfunction',fieldNames: [  'Waiting For Approval (Extra Hours)',  'Processed (Extra Hours)',  'Rejected (Extra Hours)',  'My Team (Extra Hours)',  'All Employees (Extra Hours)']
  },
  { title: 'On Behalf Of Module Sub Tabs', disableFn: 'isonlyviewfunction', fieldNames: ['Waiting For Approval (On Behalf Of)', 'Approved (On Behalf Of)', 'Request On Behalf Button', 'Rejected (On Behalf Of)', 'Processed (On Behalf Of)', 'Cancelled (On Behalf Of)', 'My Team On Behalf Of', 'On Behalf Of All Employees', 'Entitlement Summary (On Behalf Of)'] },
  { title: 'Attendance', disableFn: 'isonlyviewfunction', fieldNames: ['Request Regularization', 'Request Leave', 'Attendance Select Employee For Manager', 'Attendance Select Employee For HR'] },
  { title: 'Global Permission', disableFn: 'isonlyviewfunction', fieldNames: ['Global Permissions', 'Request Global Permission Button'] },
  { title: 'Pending Approvals Sub Tabs', disableFn: 'isonlyviewfunction', fieldNames: ['Time Off main Tab', 'Onboarding main Tab', 'Contractors main Tab', 'Offboarding main Tab', 'project management approvals main Tab', 'Time Off Tab', 'WFH Tab', 'Remote Login Tab', 'Comp Off Tab', 'Permissions Tab', 'Regularization Tab', 'Extra Hours Tab', 'Separation Request Tab', 'Recall Request Tab', 'Trainee Details Tab', 'No Due Clearence Requests Tab', 'Claims and Expenses Tab', 'Desk Requests Tab', 'Probation Details Tab', 'Time Sheet approval Tab', 'KRA KPI approval Tab', 'Recruitment approval Tab', 'Contractor Details Tab', 'Contract-Conversion Tab', 'EmployeeInfo Tab', 'Resource Approvals'] },
  { title: 'Pending Approval Time Off', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Time Off)', 'For Role (Time Off)'] },
  { title: 'Pending Approval WFH', disableFn: 'isonlycreatfunction', fieldNames: ['For You (WFH)', 'For Role (WFH)'] },
  { title: 'Pending Approval Remote Login', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Remote Login)', 'For Role (Remote Login)'] },
  { title: 'Pending Approval Contractors', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Contractors)', 'For Role (Contractors)'] },
  { title: 'Pending Approval Contract-Conversion', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Contract-Conversion)', 'For Role (Contract-Conversion)'] },
  { title: 'Pending Approval Comp Off', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Comp Off)', 'For Role (Comp Off)'] },
  { title: 'Pending Approval Permission', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Permission)', 'For Role (Permission)'] },
  { title: 'Pending Approval Regularization', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Regularization)', 'For Role (Regularization)'] },
  {title: 'Pending Approval Extra Hours',disableFn: 'isonlycreatfunction',fieldNames: [  'For You (Extra Hours)',  'For Role (Extra Hours)']},
  { title: 'Pending Approval Separation Requests', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Separation Requests)', 'For Role (Separation Requests)'] },
  { title: 'Pending Approval Recall Requests', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Recall Requests)', 'For Role (Recall Requests)'] },
  { title: 'Pending Approval Trainee Details', disableFn: 'isonlycreatfunction', fieldNames: ['Trainee Details'] },
  { title: 'Pending Approval No Due Clearance Request', disableFn: 'isonlycreatfunction', fieldNames: ['No Due Clearance Request'] },
  { title: 'Pending Approval Claims and Expenses', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Claims and Expenses)', 'For Role (Claims and Expenses)'] },
  {title: 'Pending Approval Employee Info',disableFn: 'isonlycreatfunction',fieldNames: [  'For You Employee Info',  'For Role Employee Info']},
  { title: 'Pending Approval Desk Requests', disableFn: 'isonlycreatfunction', fieldNames: ['For You (Desk Requests)', 'For Role (Desk Requests)'] },
  { title: 'Pending Approval Probation Details', disableFn: 'isonlycreatfunction', fieldNames: ['Probation Details'] },
  { title: 'Pending Approval Timesheets', disableFn: 'isonlycreatfunction', fieldNames: ['Timesheet Approvals'] },
  {title: 'On Behalf Of Approvals',disableFn: 'isonlycreatfunction',fieldNames: [  'Time Off (On Behalf Of Approvals)',  'Comp Off (On Behalf Of Approvals)',  'WFH (On Behalf Of Approvals)',  'Remote Login (On Behalf Of Approvals)',  'Employee Info (On Behalf Of Approvals)',  'Extra Hours (On Behalf Of Approvals)',  'Timesheet (On Behalf Of Approvals)',  'Permission (On Behalf Of Approvals)',  'Separations (On Behalf Of Approvals)',  'Recalls (On Behalf Of Approvals)',  'Regularization (On Behalf Of Approvals)',  'Trainee Requests (On Behalf Of Approvals)',  'Probation (On Behalf Of Approvals)',  'My Team On Behalf Of Approvals',  'On Behalf Of Approvals All Employees',  'Expenses (On Behalf Of Approvals)']},
   {title: 'Reports',disableFn: 'isonlyviewfunction',fieldNames: [  'Standard Reports',  'Custom Reports',  'Attendance reports',  'Monthly Attendance Reports',  'Policy Reports',  'Team Leave Balance',  'Team Leave Balance Summary',  'Org Leave Balance',  'Timesheet Reports',  'Expense Reports',  'Asset Report',  'IT Support Reports',  'Help Desk Reports']},
  {
  title: 'Standard Reports',
  disableFn: 'isonlyviewfunction',
  fieldNames: [
    'Employee Overview Report',
    'Employee Overview Report - Generate',
    'Employee Overview Report - Export',
    'Job Location Report',
    'Job Location Report - Generate',
    'Job Location Report - Export',
    'Branch-Wise Employee Report',
    'Branch-Wise Employee Report - Generate',
    'Branch-Wise Employee Report - Export',
    'Family Details Report',
    'Family Details Report - Generate',
    'Family Details Report - Export'
  ]
  }, { title: 'Custom Reports', disableFn: 'isonlyviewfunction', fieldNames: ['Custom Reports - Generate', 'Custom Reports - Export'] },
 {
  title: 'Attendance Reports',
  disableFn: 'isonlyviewfunction',
  fieldNames: [
    'Leave Report',
    'Leave Report - Generate',
    'Leave Report - Export',

    'Leave Summary Report',
    'Leave Summary Report - Generate',
    'Leave Summary Report - Export',

    'Comp Off Report',
    'Comp Off Report - Generate',
    'Comp Off Report - Export',

    'WFH Report',
    'WFH Report - Generate',
    'WFH Report - Export',

    'Inactive Employee Leave Summary Report',
    'Inactive Employee Leave Summary Report - Generate',
    'Inactive Employee Leave Summary Report - Export',

    'Yearly Summary Report',
    'Yearly Summary Report - Generate',
    'Yearly Summary Report - Export',

    'Permission Report',
    'Permission Report - Generate',
    'Permission Report - Export',

    'Employee Exit Report',
    'Employee Exit Report - Generate',
    'Employee Exit Report - Export',

    'Regularization Report',
    'Regularization Report - Generate',
    'Regularization Report - Export',

    'Leave Carry Forward & Encashment Report',
    'Leave Carry Forward & Encashment Report - Generate',
    'Leave Carry Forward & Encashment Report - Export',

    'Late Login Report',
    'Late Login Report - Generate',
    'Late Login Report - Export',

    'Exceeded Break Hours Report',
    'Exceeded Break Hours Report - Generate',
    'Exceeded Break Hours Report - Export',

    'Remote Login Report',
    'Remote Login Report - Generate',
    'Remote Login Report - Export',

    'Extra Log Hours Report',
    'Extra Log Hours Report - Generate',
    'Extra Log Hours Report - Export'
  ]
},
  { title: 'Monthly Attendance Reports', disableFn: 'isonlyviewfunction', fieldNames: ['Monthly Attendance Reports - Generate'] },
  { title: 'Policy Reports', disableFn: 'isonlyviewfunction', fieldNames: ['Policy Acknowledgement Report'] },
  {title: 'Attendance Reports (Employee/Team)',disableFn: 'isonlyviewfunction',fieldNames: [  'Attendance All Employees List(Leaves)',  'Attendance Team Manager List(Leaves)',  'My Team Report(Leave)','Attendance All Employees List(Leave Summary)','Attendance Team Manager List(Leave Summary)','My Team Report(Leave Summary)','Attendance All Employees List(Compoff)','Attendance Team Manager List(Compoff)','My Team Report(Compoff)','Attendance All Employees List(WFH)','Attendance Team Manager List(WFH)','My Team Report(WFH)','Attendance All Employees List(RemoteLogin)','Attendance Team Manager List(RemoteLogin)','My Team Report(RemoteLogin)','Attendance All Employees List(ExtraLogHour)','Attendance Team Manager List(ExtraLogHour)','My Team Report(ExtraLogHour)','Attendance All Employees List(Permission)','Attendance Team Manager List(Permission)','My Team Report(Permission)','Attendance All Employees List(Employee Exit)','Attendance Team Manager List(Employee Exit)','My Team Report(Employee Exit)','Attendance All Employees List(Regularization)','Attendance Team Manager List(Regularization)','My Team Report(Regularization)'
  ,'Attendance All Employees List(Leave Carry Forward & Encashment)',  'Attendance Team Manager List(Leave Carry Forward & Encashment)',  'My Team Report(Leave Carry Forward & Encashment)']
  },
  { title: 'Timesheet Reports', disableFn: 'isonlyviewfunction', fieldNames: ['My Timesheet Report', 'My Timesheet Report - Generate', 'My Timesheet Report - Export', 'Timesheet Summary Monthly Report', 'Timesheet Summary Monthly Report - Generate', 'Timesheet Summary Monthly Report - Export', 'Team Timesheet Report', 'Team Timesheet Report - Generate', 'Team Timesheet Report - Export', 'Team Timesheet Report - Admin-Approval', 'Pending Approval Status Report', 'Pending Approval Status Report - Generate', 'Pending Approval Status Report - Export', 'Project Effort Report', 'Project Effort Report - Generate', 'Project Effort Report - Export', 'Utilization Report', 'Utilization Report - Generate', 'Utilization Report - Export', 'Resource Availability Report', 'Resource Availability Report - Generate', 'Resource Availability Report - Export', 'Consolidated Timesheet Summary Report', 'Consolidated Timesheet Summary Report - Generate', 'Consolidated Timesheet Summary Report - Export', 'Attendance vs Timesheet Report', 'Attendance vs Timesheet Report - Generate', 'Attendance vs Timesheet Report - Export'] },
  { title: 'Expense Reports', disableFn: 'isonlyviewfunction', fieldNames: ['Expense Report - Generate', 'Expense Report All Employees List', 'Expense Report Manager List', 'My Team Report(Expenses)', 'Expenses All Employees List', 'Expenses Team Manager List', 'Expense Report - Export'] },
  {title: 'Asset Reports',disableFn: 'isonlyviewfunction',fieldNames: [  'Asset Report - Generate',  'Asset Report - Export']},
  { title: 'Asset Management', disableFn: 'isonlyviewfunction', fieldNames: ['Asset Management - Create', 'Asset Management - All', 'Asset Management - Available', 'Asset Management - Allocated', 'Asset Management - Under Maintenance', 'Asset Management - Inactive','Asset Management - Block'] },
  { title: 'Asset Management All Tab Actions', disableFn: 'isonlyviewfunction', fieldNames: ['All Allocate Asset', 'All Inactive Asset', 'All Mark as Maintenance', 'All Transfer Asset', 'All Reallocate Asset', 'All Release Asset', 'All Mark as Available Asset', 'All Mark as Active Asset', 'All View Asset Details', 'All Update Asset Details'] },
  { title: 'Asset Management Available Tab Actions', disableFn: 'isonlyviewfunction', fieldNames: ['Available Allocate Asset', 'Available Inactive Asset', 'Available Mark as Maintenance Asset', 'Available Transfer Asset', 'Available View Asset Details', 'Available Update Asset Details','Available Block Asset'] },
  { title: 'Asset Management Allocated Tab Actions', disableFn: 'isonlyviewfunction', fieldNames: ['Allocated Reallocate Asset', 'Allocated Release Asset', 'Allocated View Asset Details', 'Allocated Update Asset Details',] },
  { title: 'Asset Management Under Maintenance Tab Actions', disableFn: 'isonlyviewfunction', fieldNames: ['Under Maintenance Mark as Available Asset', 'Under Maintenance View Asset Details', 'Under Maintenance Update'] },
  { title: 'Asset Management Inactive Tab Actions', disableFn: 'isonlyviewfunction', fieldNames: ['Inactive Mark as Active Asset', 'Inactive View Asset Details', 'Inactive Update Asset Details'] },
    {
  title: 'Asset Management Block Tab Actions',
  disableFn: 'isonlyviewfunction',
  fieldNames: [
    'Block View Asset Details',
    'Block Update Asset Details',
    'Block Mark as Available Asset'
  ]
},
  { title: 'My Info Sub Tabs', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['My Info Personal Tab', 'My Info Job Tab', 'My Info Documents Tab', 'My Info Team Members Tab','My Info My Team Members Tab', 'My Info Onboard Request Tab', 'My Info Separation Request Details', 'My Info Exit Feedback Details'] },
  { title: 'My Info Personal Sub tabs', disableFn: 'isMyInfoPersonalActionDisabled', fieldNames: ['My Info Basic Information', 'My Info Address Details', 'My Info Contact Details', 'My Info Emergency Contact Details', 'My Info Education Details', 'My Info Identity Details', 'My Info Family Details', 'My Info Bank Details', 'My Info Visa Details', 'My Skills'] },
  { title: 'My Info Documents', disableFn: 'isonlyviewfunction', fieldNames: ['My Info Documents Upload File', 'My Info Documents Dowload File', 'My Info Documents Acknowledgment'] },
  { title: 'My Info Letter Acknowledgement', disableFn: 'isonlyviewfunction', fieldNames: ['My Info Letter Acknowledgement'] },
  {title: 'My Info Job Module',disableFn: 'isMyInfoJobActionDisabled',fieldNames: [  'My Info Pre-Onboarding Details',  'My Info Onboarding Details',  'My Info Job Details',  'My Info No Due Clearance Details',  'My Info Probation Details',  'My Info Previous Experience Details',  'My Info Certification Details',  'My Info Compensation Details',  'My Info Desk Details',  'My Info Asset Details',  'My Info Separation Request Button',  'My Info Contract Details',  'My Info Project Details',  'My Info Card Details',  'My Info Separation Request Details']},
  { title: 'My Info Separation Request Details', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Raise No Due', 'Recall', 'Early relieving'] },
  { title: 'My Info No Due Clearance Details', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Submission Of No Due Clearance', 'Re-request for no due'] },
  {title: 'My Info Exit Feedback',disableFn: 'isonlyviewfunction',fieldNames: [  'My Info Exit Feedback Details',  'My Info Exit Feedback Submit']},
  {title: 'My Info Approvals',disableFn: 'isonlyviewanddeletefunction',fieldNames: [  'My Info Personal Approval History',  'My Info Job Approval History',  'My Info Documents Approval History']},
    {
  title: 'Employee Approvals',
  disableFn: 'isonlyviewfunction',
  fieldNames: [
    'Employee Personal Approval History',
    'Employee Job Approval History',
    'Employee Documents Approval History'
  ]
},
  {title: 'Employee Info Sub tabs',disableFn: 'isPmsConfigurationCheckboxDisabled',fieldNames: [  'Employee Info Personal Tab',  'Employee Info Job Tab',  'Employee Info Documents Tab',  'Employee Info Team Members Tab',  'Reset Password Button',  'Generate Credentials Button',  'Employee Info Project Details',  'Employee Info My Team Members Tab']},
  {title: 'Employee Info Job Module',disableFn: 'isEmployeeInfoJobActionDisabled',fieldNames: [  'Employee Info Documents Verification',  'Employee Info Contract Details',  'Employee Info Pre-Onboarding Details',  'Employee Info Onboarding Details',  'Employee Info Offboarding Details',  'Employee Info Job Details',  'Employee Info Separation Request Details',  'Employee Info Exit Feedback Details',  'Employee Info No Due Clearance Details',  'Employee Info Probation Details',  'Employee Info Previous Experience Details',  'Employee Info Certification Details',  'Employee Info Onboarding Request Details',  'Employee Info Compensation Details',  'Employee Info Desk Details',  'Employee Info Asset Details',  'Employee Info Separation Request',  'No Due Form',  'Employee Info Contract Conversion Request',  'Employee Info Card Details']},
  { title: 'Employee Info Separation Request Details', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Employee Raise No Due', 'Employee Recall', 'Employee Early relieving'] },
  { title: 'Employee Info Onboard Request Details', disableFn: 'isonlyviewfunction', fieldNames: ['Request for Onboard Button', 'Request for Contract Extension Button', 'Inactive Button'] },
  { title: 'Employee Info No Due Clearance Details', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Employee Submission Of No Due Clearance', 'Employee Re-request for no due'] },
  {title: 'Employee Info Exit Feedback',disableFn: 'isonlyviewfunction',fieldNames: ['Employee Info Exit Feedback Form']},
  { title: 'Employee Info Probation Details', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Employee Request for Probation Confirmation', 'Employee Re-Request for Probation Confirmation'] },
  {title: 'Employee Info Letter Acknowledgement',disableFn: 'isPmsConfigurationCheckboxDisabled',fieldNames: [  'Employee Info Letter Acknowledgement']},
  { title: 'Dashboard Module', disableFn: 'isonlyviewfunction', fieldNames: ['Dashboard Current Openings'] },
  {title: 'Dashboard Module Card Items',disableFn: 'isPmsConfigurationCheckboxDisabled',fieldNames: ['Dashboard Prospective Employees Card','Dashboard Contract Employees Card','Dashboard Active Employees Card','Dashboard Inactive Employees Card','Dashboard Prospective Trainee Card','Dashboard Active Trainees Card','Dashboard Inactive Trainees Card','Dashboard Job Openings Card','Dashboard Probation Employees Card','Add Prospective Employee','Add Prospective Trainee','Dashboard Active Contract employees Card','Add Contract Employee','Invite New User','Dashboard Active Invite New User','Dashboard Trainee Active Invite New User','Dashboard Active Contract Invite New User']},
  { title: 'Dashboard Documents Historys', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Documents History Offer Letter', 'Documents History Contract Offer Letter', 'Documents History Appointment Letter', 'Documents History Trainee Offer Letter', 'Documents History Trainee Appointment Letter', 'Documents History Non-Disclosure Agreement Letter'] },
  {title: 'Active Letters',disableFn: 'isPmsConfigurationCheckboxDisabled',fieldNames: ['Address Proof Letter','Bank Loan Letter','Apprisal Letter','Salary Revision Letter','Promotion Letter','Contract Offer Letter','NDA Letter','Work Order Letter']}, { title: 'Inactive Letters', disableFn: 'isonlyviewfunction', fieldNames: ['Relieving Letter'] },
  { title: 'Probation Generate Documents', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Probation Confirmation Letter', 'Probation Extension Letter'] },
  { title: 'Dashboard Document History Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Offer Letter Download', 'Offer Letter Release Offer', 'Offer Letter Approve', 'Offer Letter Reject', 'Appointment Letter Download', 'Trainee Offer Letter Download', 'Trainee Offer Letter Release Offer', 'Trainee Offer Letter Approve', 'Trainee Offer Letter Reject', 'Trainee Appointment Letter Download'] },
  {title: 'Dashboard Documents History',disableFn: 'isPmsConfigurationCheckboxDisabled',fieldNames: ['Dashboard Generate Documents Offer Letter','Dashboard Generate Documents Appointment Letter','Dashboard Generate Documents Trainee Offer Letter','Dashboard Generate Documents Trainee Appointment Letter','Dashboard Generate Documents Offer Letter','Dashboard Generate Documents Appointment Letter','Dashboard Generate Documents Trainee Relieving Letter','Dashboard Generate Documents Trainee Offer Letter','Dashboard Generate Documents Trainee Appointment Letter']}, { title: 'Employee Info Personal Sub tabs', disableFn: 'isEmployeeInfoPersonalActionDisabled', fieldNames: ['Employee Info Basic Information', 'Employee Info Address Details', 'Employee Info Contact Details', 'Employee Info Emergency Contact Details', 'Employee Info Education Details', 'Employee Info Identity Details', 'Employee Info Family Details', 'Employee Info Bank Details', 'Employee Info Visa Details', 'Employee My Skills'] },
  { title: 'Employee Info Documents', disableFn: 'isonlyviewfunction', fieldNames: ['Employee Info Documents Upload File', 'Employee Info Documents Dowload File', 'Employee Info Documents Acknowledgment'] },
  { title: 'Employee Info Team Members', disableFn: 'isemployeeinfoteamActionDisabled', fieldNames: ['Employee Info Reporting Manager Tab', 'Employee Info Change RM Button', 'Employee Info Team Managers Tab', 'Employee Info Change TM Button', 'Employee Info Team Members','Employee Info Location Change Tab'] },
  { title: 'PMS Module', disableFn: 'isPmsModuleCheckboxDisabled', fieldNames: ['Review Cycle List', 'Review Cycle Employee List', 'My Performance Review', 'My Team Performance Review', 'KRA', 'KPI', 'Assign KRA KPI', 'My KRA KPI', 'Team KRA KPI', 'Dashboard KRA KPI', 'My Team (KRA)', 'All Employees (KRA)', 'My Team (KRA KPI Dashboard)', 'All Employees (KRA KPI Dashboard)'] },
  { title: 'Review Cycle List Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Create Review Cycle', 'Hold', 'Resume', 'Update', 'View', 'Initiate'] },
  { title: 'Review Cycle Employee List Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Assign Review Template', 'Employee List Add Employee', 'Download Appraisal Report', 'Generate Appraisal Letters', 'Send Appraisal Letters', 'Generate Promotion Letters', 'Send Promotion Letters', 'Employee List Hold', 'Assign Review Template(Employee)', 'Assign Review Template(Review on Hold)', 'Update Review Template', 'Employee List Resume', 'Promotion Letter Download', 'Appraisal Letter Download', 'Generate Appraisal Letter(Status - Completed)', 'Send Appraisal Letter(Appraisal Letter Generated)', 'Re-Generate Appraisal Letter', 'Re-Send Appraisal Letter', 'Re-Generate Appraisal Letter(Promotion Letter Generated)', 'Re-Send Appraisal Letter(Promotion Letter Sent)', 'Generate Promotion Letter(Status - Completed)', 'Re-Generate Promotion Letter', 'Send Promotion Letter', 'Re-Send Promotion Letter', 'Re-Generate Promotion Letter(Appraisal Letter Generated)', 'Re-Send Promotion Letter(Appraisal Letter Sent)'] },
  { title: 'My Performance Review Tabs Section', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Pending Reviews', 'Completed Reviews'] },
  { title: 'Pending Reviews Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['My Performance Assessment'] },
  { title: 'Completed Reviews Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['My Performance Assessment View', 'My Performance Promotion Letter Download', 'My Performance Appraisal Letter Download'] },
  { title: 'Team Performance Review Tabs Section', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Team Pending Reviews', 'Team Completed Reviews'] },
  { title: 'Team Pending Reviews Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Team Assessment'] },
  { title: 'Team Completed Reviews Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Team Assessment View', 'Team Promotion Letter Download', 'Team Appraisal Letter Download'] },
  { title: 'PMS Configuration Module', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Increment Percentage', 'Assessor Configuration', 'Kra Configuration'] },
  { title: 'Increment Percentage Actions', disableFn: 'isPmsConfigurationCheckboxDisabled', fieldNames: ['Increment Create', 'Increment Update(Status - Created)', 'Increment Delete(Status - Created)', 'Increment View(Status - Initialted)', 'Increment Update(Status - Review On Hold)'] },
  { title: 'Assessor Configuration Actions', disableFn: 'isAssetCheckboxDisabled', fieldNames: ['Assessor Create', 'Assessor Update(Status - Created)', 'Assessor Delete(Status - Created)', 'Assessor Update(Status - Initialted)', 'Assessor Update(Status - Review On Hold)'] },
  { title: 'Kra Configuration Actions', disableFn: 'isAssetCheckboxDisabled', fieldNames: ['Kra Create', 'Kra Update(Status - Created)', 'Kra Delete(Status - Created)', 'Kra Update(Status - Initialted)', 'Kra Update(Status - Review On Hold)'] },
  { title: 'Events Tabs', disableFn: 'isProjectManagementTabsCheckboxDisabled', fieldNames: ['Events(Upcoming Events)'] },
  { title: 'Settings Header Icon', disableFn: 'isonlyviewfunction', fieldNames: ['Settings Icon'] },
  { title: 'Project Management Configuration Fields', disableFn: 'isSettingsProjectManagementConfig', fieldNames: ['Project Type', 'Industry Type', 'Project Document Type', 'Client Document Type', 'Letter Configurations', 'Project Management Authority', 'Letter Frequency Configurations', 'Project Role','Task', 'Task Type','Timesheet Configurations'] },
  { title: 'Helpdesk Configuration Fields', disableFn: 'isSettingsProjectManagementConfig', fieldNames: ['Category', 'Subcategory'] },
  { title: 'Project Management Projects Tabs', disableFn: 'isProjectManagementTabsCheckboxDisabled', fieldNames: ['Project Details Tab', 'Contact Info Tab', 'Documents Tab', 'Resources Tab', 'Project Timesheets Tab', 'Project Phases Tab', 'Project Detailed Tab','View All Projects', 'View Assigned Projects'] }, { title: 'Project Management Clients Tabs', disableFn: 'isProjectManagementClientsTabsCheckboxDisabled', fieldNames: ['Client Information', 'Contact Information', 'Client Projects', 'Client Resources', 'Client Timesheets', 'Client Documents', 'Client Detailed Tab','View All Clients', 'View Assigned Clients'] },
  { title: 'Project Management Documents', disableFn: 'isonlyviewfunction', fieldNames: ['MSA Document', 'NDA Document'] },
  {title: 'Recruitment Jobs',disableFn: 'isapplicationscreeningfunction',fieldNames: ['Active Jobs','Inactive Jobs','Closed Jobs']},
   {title: 'Job View Permissions',disableFn: 'isapplicationscreeningfunction',fieldNames: ['Job Shortlisted','Job Interview Review','Job Rejected','Job On Hold','Job Request Onboarding','Job Onboarded','Job Archive','Job Revoke']},
  {title: 'Job View Action Permissions',disableFn: 'isonlyviewfunction',fieldNames: ['Job View Initiate Interview Round','Job View On Hold','Job View Rejected','Job View Schedule Next Round','Job View Reschedule Interview','Job View Request to Onboard','Job View View Reject Reason','Job View View On Hold Reason']},
  {title: 'On Behalf Of Tabs',disableFn: 'isonlyviewfunction',fieldNames: ['On Behalf Of','On Behalf Of WFH','On Behalf Of RemoteLogin','On Behalf Of Expenses']}, {title: 'On Behlaf Of WFH Tabs',disableFn: 'isonlyviewfunction',fieldNames: ['Waiting For Approval (On Behalf Of WFH)','Approved (On Behalf Of WFH)','Processed (On Behalf Of WFH)','Rejected (On Behalf Of WFH)','Cancelled (On Behalf Of WFH)','On Behalf Of WFH All Employees','On Behalf Of WFH Team','Request On Behalf Of WFH Button']},
   {title: 'On Behalf Of Remote Login Tabs',disableFn: 'isonlyviewfunction',fieldNames: ['Waiting For Approval (On Behalf Of RemoteLogin)','Approved (On Behalf Of RemoteLogin)','Processed (On Behalf Of RemoteLogin)','Rejected (On Behalf Of RemoteLogin)','Cancelled (On Behalf Of RemoteLogin)','On Behalf Of RemoteLogin All Employees','On Behalf Of RemoteLogin Team','Request On Behalf Of RemoteLogin Button']}, {title: 'On Behalf Of Expenses Tabs',disableFn: 'isonlyviewfunction',fieldNames: ['Waiting For Approval (On Behalf Of Expenses)','Approved (On Behalf Of Expenses)','Processed (On Behalf Of Expenses)','Rejected (On Behalf Of Expenses)','On Behalf Of Expenses All Employees','On Behalf Of Expenses Team','Request On Behalf Of Expenses Button']},
  { title: 'Timesheet Module', disableFn: 'isonlyviewfunction', fieldNames: ['Team Time Sheet', 'My Summary', 'Team Time Sheet Detailed Tab', 'Team Time Sheet Summary Tab', 'Team Time Sheet Filters Tab', 'Team Time Sheet Department Filter', 'Team Time Sheet RM/TM Filter', 'My Team (Timesheet)', 'All Employees (Timesheet)', 'Timesheet Bulk Import', 'Timesheet Bulk Export', 'View History Export Tab', 'View History Import Tab', 'Timesheet Clone'] }, {title: 'Locking System Tabs',disableFn: 'isonlyviewfunction',fieldNames: [  'Attendance Configuration Module',  'Timesheet Configuration Module', ]},
   { title: 'Attendance Locking Type Tabs', disableFn: 'isDynamicFormsDisabled', fieldNames: ['Attendance Pending Tab', 'Attendance Published Tab'] },
  {title: 'IT Support Configuration Fields',disableFn: 'isonlyviewfunction',fieldNames: [  'IT Support Configuration']},
   {title: 'IT Support Fields',disableFn: 'isSettingsEmployeeJobCheckboxDisabled',fieldNames: [  'IT Support Category',  'IT Support Sub-Category']},
  {title: 'Timesheet Locking Type Tabs',disableFn: 'isDynamicFormsDisabled',fieldNames: [  'Timesheet Locking Pending Tab',  'Timesheet Locking Published Tab']},
  { title: 'Skill Set Module', disableFn: 'isonlyviewfunction', fieldNames: ['Skills Dashboard', 'Skills Directory'] },
  {title: 'Applicant Screening',disableFn: 'isapplicationscreeningfunction',fieldNames: [  'Active Applicants',  'Screening Completed Applicants']},
  { title: 'Help Desk Reports', disableFn: 'isonlyviewfunction', fieldNames: ['Help Desk Query Detailed Report', 'Help Desk Query Detailed Report - Generate', 'Help Desk Query Detailed Report - Export', 'Help Desk Query Summary Report', 'Help Desk Query Summary Report - Generate', 'Help Desk Query Summary Report - Export'] },
  {title: 'IT Support Reports',disableFn: 'isonlyviewfunction',fieldNames: [  'IT Support Detailed Report',  'IT Support Detailed Report - Generate',  'IT Support Detailed Report - Export',  'IT Support Summary Report',  'IT Support Summary Report - Generate',  'IT Support Summary Report - Export']},


];
