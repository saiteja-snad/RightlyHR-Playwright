import { Route } from '@angular/router';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { BulkImportComponent } from './bulk-import/bulk-import.component';
import { HistoryLogComponent } from './history-log/history-log.component';

export default [
  { path: '', redirectTo: 'bulk-import', pathMatch: 'full' },
  { path: 'bulk-import', component: BulkImportComponent, canActivate: [PermissionsGuard], data: { permission: 'Bulk Import/Upload.view' } },
  { path: 'historylog', component: HistoryLogComponent, canActivate: [PermissionsGuard], data: { permission: 'View History.view' } },
] as unknown as Route[];
