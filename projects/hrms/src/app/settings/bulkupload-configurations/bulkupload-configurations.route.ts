import { Route } from '@angular/router';
import { BulkImportComponent } from './bulk-import/bulk-import.component';
import { HistoryLogComponent } from './history-log/history-log.component';

export default [
  { path: '', redirectTo: 'bulk-import', pathMatch: 'full' },
  { path: 'bulk-import', component: BulkImportComponent },
  { path: 'historylog', component: HistoryLogComponent },
] as unknown as Route[];
