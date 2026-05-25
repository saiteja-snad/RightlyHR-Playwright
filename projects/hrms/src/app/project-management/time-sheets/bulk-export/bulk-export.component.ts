import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, computed, OnDestroy, OnInit, signal, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BulkUploadService } from '../../../services/bulk-upload.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { ModuleInfoIconComponent } from '../../../icons/module-info-icon/module-info-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { ModuleInformationComponent } from '../../../shared/module-information/module-information.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { TimesheetsTabsComponent } from '../../../shared/project-management-tabs/timesheets-tabs/timesheets-tabs.component';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpService } from '../../../services/http.service';
import moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';

interface TimesheetDetailItem {
  employeeId: number;
  fusionEmpId: string;
  employeeName: string;
  entryDate: string;
  clientId: number;
  clientName: string;
  projectId: number;
  projectName: string;
  phaseId: number;
  phaseName: string;
  duration: string;
  description: string;
  isBillable: boolean;
  billableStatus: string;
  status: string;
  timesheetEntryId: number;
  approverId: number;
  projectMeta?: any;
  clientMeta?: any;
  phaseMeta?: any;
  taskName:string;
}

interface TimesheetExportPreviewRow {
  timesheetEntryId: number;
  entryDate: string;
  clientName: string;
  projectName: string;
  projectCode: string;
  phaseName: string;
  duration: string;
  billable: string;
  description: string;
  status: string;
  projectMeta: {
    graphData: {
      color: string;
      code: string;
    }
  } | null;
  clientMeta: {
    graphData: {
      color: string;
    }
  } | null;
  phaseMeta: {
    graphData: {
      color: string;
    }
  } | null;
  taskName:string;
}

interface TimesheetExportState {
  fileName: string;
  rows: TimesheetExportPreviewRow[];
  raw: TimesheetDetailItem[];
}

interface TimesheetExportFiltersState {
  startDate: string;
  endDate: string;
  projectIds: number[];
  phaseIds: number[];
  searchQuery: string;
  status: string;
}

@Component({
  selector: 'app-bulk-export',
  imports: [TimesheetsTabsComponent, CommonModule,
    NoDataFoundComponent, InfoIconComponent,
    DateformatPipe, NgbPopoverModule,
    FormsModule, ConfirmationIconComponent,
    ModuleInformationComponent, ModuleInfoIconComponent,
    DataLoaderContentComponent, ReactiveFormsModule,
    DatePicker, MultiSelectModule,
    TranslateModule],
  templateUrl: './bulk-export.component.html',
  styleUrl: './bulk-export.component.scss',
})
export class BulkExportComponent implements OnInit, OnDestroy {
  steps = [
    { id: 1, name: 'Select Filters' },
    { id: 2, name: 'Preview & Export' },
  ];
  progress = 1;
  destroy$: Subject<boolean> = new Subject<boolean>();
  empdata = {} as any;
  employeeId: any;
  moduleinfo: string = '';
  routeToInfoMap!: { [key: string]: string };
  resourceData: any[] = [];
  groupedProjects: any[] = [];
  searchValue: string = '';
  exportProjectOptions: any[] = [];
  exportPhaseOptions: any[] = [];
  selectedPhasesLabel = 'All Phases';
  selectedProjectsLabel = 'All Projects';
  selectedTasksLabel = 'All Tasks';
  maxSelectedProjectsLabels = 0;
  maxSelectedPhasesLabels = 0;
  maxSelectedTasksLabels = 0;
  @ViewChild('stagingLoadingModal') stagingLoadingModal!: TemplateRef<any>;
  private searchSubject = new Subject<string>();
  exportForm!: FormGroup;
  monthRange: Date[] = [];
  ALL_PROJECTS_ID = -1;
  ALL_PHASES_ID = -1;
  ALL_TASKS_ID = -1;
  previousProjectSelection: number[] = [];
  previousPhaseSelection: number[] = [];
  previousTaskSelection: number[] = [];
  exportTaskOptions: any[] = [];
  exporting = false;
  isFilteredExport = false;
  exportClients: any[] = [];
  exportLoading = signal(false);
  exportState = signal<TimesheetExportState | null>(null);
  exportStore = {
    loading: this.exportLoading,
    response: this.exportState,
    reset: () => {
      this.exportLoading.set(false);
      this.exportState.set(null);
    },
  };
  private readonly exportStepStorageKey = 'timesheetExportStep';
  private readonly exportFiltersStorageKey = 'timesheetExportFilters';
  private pendingRestoreFilters: TimesheetExportFiltersState | null = null;
  private isRestoringFilters = false;
  private searchTerm = signal('');
  readonly filteredRows = computed(() => {
    return this.exportState()?.rows ?? [];
  });
  // moduleinfo: string = '';
  isFilterIndicatorActive = false;
  spinnerLoader2 = false;
  spinnerLoader1 = false;
  taskType: any[] = [];

  constructor(private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private service: BulkUploadService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private offcanvasService: NgbOffcanvas
  ) {

  }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeId = this.empdata?.employeeId;
    const savedStep = localStorage.getItem(this.exportStepStorageKey);
    this.progress = savedStep ? +savedStep : 1;
    this.updateModuleInfo();
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    this.setMonthRange(startOfMonth.toDate(), endOfMonth.toDate());
    this.initExportForm();
    this.getTaskType();


    const range = this.monthRange;
    this.exportForm.patchValue(
      {
        dateRange: range,
        projectIds: [],
        phaseIds: [],
      },
      { emitEvent: false }
    );

    if (this.progress === 2) {
      this.exportStore.reset();
      this.setStep(1);
    }

    if (range && range.length === 2) {
      const start = moment(range[0]).format('YYYY-MM-DD');
      const end = moment(range[1]).format('YYYY-MM-DD');
      this.fetchExportResources(start, end);
    }


    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchTerm.set(value || '');
      this.loadDetailsForPreview(this.searchTerm(), false);

    });

    this.exportForm.get('dateRange')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((range: any) => {
      if (this.isRestoringFilters) return;
      if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) return;
      const start = moment(range[0]).format('YYYY-MM-DD');
      const end = moment(range[1]).format('YYYY-MM-DD');
      this.monthRange = [range[0], range[1]];
      this.saveFiltersToStorage();
      this.fetchExportResources(start, end);
    });
  }

  get isGenerateDisabled(): boolean {
    const { phaseIds, projectIds, taskIds, dateRange } = this.exportForm.value;
    return !(phaseIds && phaseIds.length > 0 ||
      projectIds && projectIds.length > 0 ||
      taskIds && taskIds.length > 0 ||
      dateRange && (dateRange[0] || dateRange[1]));
  }

  isFilterApplied(): boolean {
    const { phaseIds, projectIds, taskIds, dateRange } = this.exportForm.value;
    return (phaseIds && phaseIds.length > 0) ||
      (projectIds && projectIds.length > 0) ||
      (taskIds && taskIds.length > 0) ||
      (dateRange && (dateRange[0] || dateRange[1]));
  }

  clearAllFilters(): void {
    const start = moment().startOf('month').toDate();
    const end = moment().endOf('month').toDate();
    this.monthRange = [start, end];
    this.isRestoringFilters = true;
    this.exportForm.patchValue(
      { dateRange: [start, end], projectIds: [], phaseIds: [] ,taskIds: []},
      { emitEvent: false }
    );
    this.isRestoringFilters = false;
    this.exportStore.reset();
    this.searchValue = '';
    this.searchTerm.set('');
    this.isFilterIndicatorActive = false;
    this.clearFiltersStorage();
    this.setStep(1);
    // Re-fetch resources for default range — buildExportOptionsFiltered will select all projects/phases
    const startStr = moment(start).format('YYYY-MM-DD');
    const endStr = moment(end).format('YYYY-MM-DD');
    this.fetchExportResources(startStr, endStr);
    this.buildTaskOptions();
  }

  setMonthRange(start: Date, end: Date) {
    this.monthRange = [start, end];
  }
  updateModuleInfo() {
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.routeToInfoMap = {
      '/project-management/timesheet/bulk-export': MODULE_INFOS.TIMESHEET_BULK_EXPORT,
      // '/project-management/timesheet/summary': MODULE_INFOS.Team_Timesheet_Summary_view
    };
    this.moduleinfo = this.routeToInfoMap[urlWithoutQuery] || '';
  }



  navigatetomy() {
    this.router.navigate(['project-management/timesheet/mytimesheet']);
  }


  formatCount(value: number | null | undefined): string {
    const n = value ?? 0;
    return n < 10 ? `0${n}` : String(n);
  }

  confirmUpload(content: any, event?: Event) {
    if (event && event.target) {
      (event.target as HTMLElement).blur();
    }
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  private initExportForm() {
    this.exportForm = this.fb.group({
      dateRange: [[], [Validators.required]],
      projectIds: [[]],
      phaseIds: [[]],
      taskIds : [[]]
    });
  }

  fetchExportResources(startDate: string, endDate: string) {
    this.http.getDataIncludeParams(`ProjectResource?status=active&employeeId=${this.employeeId}&isProjectRequired=true&startDate=${startDate}&endDate=${endDate}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.success) {
          const rawData = res.data;
          this.exportClients = rawData.reduce((acc: any[], curr: any) => {
            const clientId = curr?.client?.clientId || 0;
            let existingClient = acc.find((c) => c.clientId === curr.client.clientId);
            // Build phase object (if exists)
            const phaseObj = curr.phase ? {
              phaseId: curr.phase.phaseId,
              phaseName: curr.phase.phaseName,
              allocatedHours: curr.phase.allocatedHours,
              status: curr.phase.status,
              startDate: curr.phase.startDate,
              endDate: curr.phase.endDate,
              meta: curr.phase.meta || null,
              color: curr.phase.meta?.graphData?.color || null
            } : null;
            const projectObj = {
              projectId: curr?.project?.projectId,
              projectName: curr?.project?.projectName,
              startDate: curr?.startDate,
              endDate: curr?.endDate,
              status: curr?.status,
              role: curr?.role,
              isWeekendAllowed: curr?.project?.isWeekendAllowed || curr?.client?.isWeekendAllowed,
              isOverTimeAllowed: curr?.project?.isOverTimeAllowed || curr?.client?.isOverTimeAllowed,
              isBillable: curr?.project?.isbillable || curr?.client?.isbillable,
              phases: phaseObj ? [phaseObj] : [],
              meta: curr?.project?.meta || null,
              color: curr?.project?.meta?.graphData?.color || null
            }
            if (!existingClient) {
              // Create new client
              existingClient = {
                clientId: clientId,
                clientName: curr?.client?.clientName || 'No Client',
                projects: [],
                shift: curr?.shift,
                meta: curr?.client?.meta || null,
                color: curr?.client?.meta?.graphData?.color || null
              };
              acc.push(existingClient);
            }
            // Find existing project in that client
            let existingProject = existingClient.projects.find(
              (p: any) => p.projectId === projectObj.projectId
            );

            if (!existingProject) {
              // Add new project
              existingClient.projects.push(projectObj);
            } else if (phaseObj) {
              // Add phase only if not already present
              const phaseExists = existingProject.phases.some(
                (ph: any) => ph.phaseId === phaseObj.phaseId
              );
              if (!phaseExists) {
                existingProject.phases.push(phaseObj);
              }
            }
            return acc;
          }, []);

          this.buildExportOptionsFiltered();

          if (this.pendingRestoreFilters) {
            const restored = this.pendingRestoreFilters;
            this.isRestoringFilters = true;
            this.exportForm.patchValue(
              {
                projectIds: restored.projectIds,
                phaseIds: restored.phaseIds,
              },
              { emitEvent: false }
            );
            this.previousProjectSelection = restored.projectIds;
            this.previousPhaseSelection = restored.phaseIds;
            this.updateProjectsLabel(restored.projectIds);
            this.updatePhasesLabel(restored.phaseIds);
            this.searchValue = restored.searchQuery || '';
            this.searchTerm.set(restored.searchQuery || '');
            this.pendingRestoreFilters = null;
            this.isRestoringFilters = false;
            if (this.progress === 2) {
              this.loadDetailsForPreview(this.searchTerm(), true);
            }
          }
        }
      });
  }

  buildExportOptionsFiltered() {
    const projectMap = new Map<number, string>();
    const phaseMap = new Map<number, string>();

    // Always add No Client - No Project default option
    projectMap.set(0, 'No Client - No Project');

    this.exportClients.forEach((client: any) => {
      (client.projects || []).forEach((p: any) => {
        if (p.projectId !== null && p.projectId !== undefined) {
          const hasClientName = !!client.clientName;
          const clientLabel = client.clientName === 'No Client' ? 'No Client' : client.clientName;
          const projectCode = p.meta?.graphData?.code || '';
          const label = hasClientName ? `${clientLabel} - ${p.projectName} (${projectCode})` : p.projectName;
          projectMap.set(p.projectId, label);
        }
        (p.phases || []).forEach((ph: any) => {
          if (ph.phaseId !== null && ph.phaseId !== undefined) {
            const projectCode = p.meta?.graphData?.code;
            const label = projectCode ? `${ph.phaseName} (${projectCode})` : ph.phaseName;
            phaseMap.set(ph.phaseId, label);
          }
        });
      });
    });
    this.exportProjectOptions = Array.from(projectMap.entries()).map(([value, label]) => ({ label, value }));
    this.exportProjectOptions.unshift({ label: 'All Projects', value: this.ALL_PROJECTS_ID });
    this.exportPhaseOptions = Array.from(phaseMap.entries()).map(([value, label]) => ({ label, value }));
    if (this.exportPhaseOptions.length > 0) {
      this.exportPhaseOptions.unshift({ label: 'All Phases', value: this.ALL_PHASES_ID });
    }

    if (this.pendingRestoreFilters) {
      const restored = this.pendingRestoreFilters;
      const normalizedProjectIds = this.normalizeAllSelection(
        restored.projectIds,
        this.exportProjectOptions.map(o => o.value),
        this.ALL_PROJECTS_ID
      );
      const normalizedPhaseIds = this.normalizeAllSelection(
        restored.phaseIds,
        this.exportPhaseOptions.map(o => o.value),
        this.ALL_PHASES_ID
      );

      this.pendingRestoreFilters = {
        ...restored,
        projectIds: normalizedProjectIds,
        phaseIds: normalizedPhaseIds,
      };

      this.updateProjectsLabel(normalizedProjectIds);
      this.updatePhasesLabel(normalizedPhaseIds);
      return;
    }

    // Select all projects and phases by default
    const allProjectIds = this.exportProjectOptions.map(opt => opt.value);
    const allPhaseIds = this.exportPhaseOptions.map(opt => opt.value);
    this.exportForm.patchValue({
      projectIds: allProjectIds,
      phaseIds: allPhaseIds
    });
    this.previousProjectSelection = allProjectIds;
    this.previousPhaseSelection = allPhaseIds;
    this.selectedProjectsLabel = 'All Projects';
    this.selectedPhasesLabel = 'All Phases';
    this.maxSelectedProjectsLabels = 0;
    this.maxSelectedPhasesLabels = 0;
    this.saveFiltersToStorage();
  }

  onProjectSelectionChange(event: any) {
    const currentSelection = event.value as number[];
    const allProjectsId = this.ALL_PROJECTS_ID;
    const allOptionSelected = currentSelection.includes(allProjectsId);
    const wasAllSelected = this.previousProjectSelection.includes(allProjectsId);

    let newSelection = [...currentSelection];
    const allOptionValues = this.exportProjectOptions.map(o => o.value);

    // Case 1: "All Projects" was just selected
    if (allOptionSelected && !wasAllSelected) {
      newSelection = allOptionValues;
    }
    // Case 2: "All Projects" was just deselected (explicitly)
    else if (!allOptionSelected && wasAllSelected) {
      // Check if it was explicitly removed (meaning user clicked it to uncheck)
      // Or if it was removed because an individual item was removed?
      // Logic: If user unchecks "All Projects", we clear everything.
      // But if user unchecks "Project A", we must uncheck "All Projects" but keep "Project B".

      // If ONLY "All Projects" is missing compared to previous (and maybe other items if they were unchecked simultaneously? No, MultiSelect is one by one usually),
      // we assume explicit deselect.

      // Wait, if user unchecks an item, `currentSelection` will NOT have that item, AND `currentSelection` will NOT have `ALL_PROJECTS_ID` (because we enforce consistency)?
      // No, `currentSelection` comes from the component state before we fix it.
      // If user unchecks "Project A": `currentSelection` = [All, B].
      // Wait, `p-multiSelect` UI state: User clicks "Project A" (unchecked). `event.value` will be [All, B].
      // Then we see "All" is present, but "Project A" is missing.
      // So "All" shouldn't be there.

      // Let's refine based on what changed.
      const added = currentSelection.filter(x => !this.previousProjectSelection.includes(x));
      const removed = this.previousProjectSelection.filter(x => !currentSelection.includes(x));

      if (removed.includes(allProjectsId)) {
        // "All Projects" was removed.
        // Did user remove ONLY "All Projects"?
        if (removed.length === 1) {
          newSelection = [];
        }
      } else {
        // Individual item(s) removed.
        // "All Projects" is still in `currentSelection` (from UI perspective), but needs to be removed.
        if (allOptionSelected) {
          newSelection = newSelection.filter(id => id !== allProjectsId);
        }
      }
    }
    // Case 3: Individual item added
    else {
      // Check if all real items are selected
      const realItems = allOptionValues.filter(v => v !== allProjectsId);
      const selectedRealItems = newSelection.filter(v => v !== allProjectsId);

      if (selectedRealItems.length === realItems.length) {
        if (!newSelection.includes(allProjectsId)) {
          newSelection.push(allProjectsId);
        }
      } else {
        // Should already be handled by Case 2 logic for removal, but for addition:
        // If we add an item and it completes the set, we add "All Projects".
        // If we add an item but set is incomplete, ensure "All Projects" is NOT there.
        if (newSelection.includes(allProjectsId)) {
          newSelection = newSelection.filter(id => id !== allProjectsId);
        }
      }
    }

    // Update form and history
    // We need to suppress event emission to avoid loop? patchValue usually emits.
    // But this method is called from (onChange), so the value in control might already be updated?
    // p-multiSelect with formControlName writes to control.
    // If we write back to control, it updates UI.

    if (JSON.stringify(newSelection.sort()) !== JSON.stringify(currentSelection.sort())) {
      this.exportForm.get('projectIds')?.patchValue(newSelection, { emitEvent: false });
      this.previousProjectSelection = newSelection;
    } else {
      this.previousProjectSelection = currentSelection;
    }

    // Update label
    this.updateProjectsLabel(newSelection);
    this.saveFiltersToStorage();
  }

  onPhaseSelectionChange(event: any) {
    const currentSelection = event.value as number[];
    const allPhasesId = this.ALL_PHASES_ID;
    const allOptionSelected = currentSelection.includes(allPhasesId);
    const wasAllSelected = this.previousPhaseSelection.includes(allPhasesId);

    let newSelection = [...currentSelection];
    const allOptionValues = this.exportPhaseOptions.map(o => o.value);

    // Case 1: "All Phases" was just selected
    if (allOptionSelected && !wasAllSelected) {
      newSelection = allOptionValues;
    }
    // Case 2: "All Phases" was just deselected (explicitly)
    else if (!allOptionSelected && wasAllSelected) {
      const added = currentSelection.filter(x => !this.previousPhaseSelection.includes(x));
      const removed = this.previousPhaseSelection.filter(x => !currentSelection.includes(x));

      if (removed.includes(allPhasesId)) {
        if (removed.length === 1) {
          newSelection = [];
        }
      } else {
        if (allOptionSelected) {
          newSelection = newSelection.filter(id => id !== allPhasesId);
        }
      }
    }
    // Case 3: Individual item added
    else {
      const realItems = allOptionValues.filter(v => v !== allPhasesId);
      const selectedRealItems = newSelection.filter(v => v !== allPhasesId);

      if (selectedRealItems.length === realItems.length) {
        if (!newSelection.includes(allPhasesId)) {
          newSelection.push(allPhasesId);
        }
      } else {
        if (newSelection.includes(allPhasesId)) {
          newSelection = newSelection.filter(id => id !== allPhasesId);
        }
      }
    }

    if (JSON.stringify(newSelection.sort()) !== JSON.stringify(currentSelection.sort())) {
      this.exportForm.get('phaseIds')?.patchValue(newSelection, { emitEvent: false });
      this.previousPhaseSelection = newSelection;
    } else {
      this.previousPhaseSelection = currentSelection;
    }

    // Update label
    this.updatePhasesLabel(newSelection);
    this.saveFiltersToStorage();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  private normalizeAllSelection(selection: number[], allOptionValues: number[], allId: number): number[] {
    const unique = Array.from(new Set(selection));
    const realItems = allOptionValues.filter(v => v !== allId);
    const selectedRealItems = unique.filter(v => v !== allId);
    const allSelected = realItems.length > 0 && selectedRealItems.length === realItems.length;

    if (allSelected) {
      return Array.from(new Set([...selectedRealItems, allId]));
    }
    return selectedRealItems;
  }

  private updateProjectsLabel(selection: number[]) {
    const allId = this.ALL_PROJECTS_ID;
    const allOptionValues = this.exportProjectOptions.map(o => o.value);
    const normalized = this.normalizeAllSelection(selection, allOptionValues, allId);
    const selectedRealItems = normalized.filter(v => v !== allId);
    const realItems = allOptionValues.filter(v => v !== allId);
    const isAllSelected = realItems.length > 0 && selectedRealItems.length === realItems.length;

    if (isAllSelected) {
      this.selectedProjectsLabel = 'All Projects';
      this.maxSelectedProjectsLabels = 0;
    } else {
      this.selectedProjectsLabel = '{0} items selected';
      this.maxSelectedProjectsLabels = 2;
    }
  }

  private updatePhasesLabel(selection: number[]) {
    const allId = this.ALL_PHASES_ID;
    const allOptionValues = this.exportPhaseOptions.map(o => o.value);
    const normalized = this.normalizeAllSelection(selection, allOptionValues, allId);
    const selectedRealItems = normalized.filter(v => v !== allId);
    const realItems = allOptionValues.filter(v => v !== allId);
    const isAllSelected = realItems.length > 0 && selectedRealItems.length === realItems.length;

    if (isAllSelected) {
      this.selectedPhasesLabel = 'All Phases';
      this.maxSelectedPhasesLabels = 0;
    } else {
      this.selectedPhasesLabel = '{0} items selected';
      this.maxSelectedPhasesLabels = 2;
    }
  }

  private getClientIdsForProjects(projectIds: number[]): number[] {
    const ids = new Set<number>();
    for (const pid of projectIds) {
      if (pid === 0) {
        ids.add(0);
        continue;
      }
      for (const client of this.exportClients) {
        const projects = client?.projects || [];
        if (projects.some((p: any) => p.projectId === pid)) {
          ids.add(client.clientId);
          break;
        }
      }
    }
    return Array.from(ids);
  }

  private toUtcStartOfDayIso(date: any): string {
  return moment(date).format('YYYY-MM-DD') + 'T00:00:00.000';
}

 private toUtcEndOfDayIso(date: any): string {
  return moment(date).format('YYYY-MM-DD') + 'T00:00:00.000';
}

  private buildDetailsPayload(searchQuery?: string): any {
    const value = this.exportForm.value as any;
    const range = value.dateRange || [];
    const projectIds: number[] = value.projectIds || [];
    const phaseIds: number[] = value.phaseIds || [];
    const taskIds: number[] = value.taskIds || [];

    const filteredProjectIds = projectIds.filter((id) => id !== this.ALL_PROJECTS_ID);
    const filteredPhaseIds = phaseIds.filter((id) => id !== this.ALL_PHASES_ID);
    const filteredTaskIds = taskIds.filter((id) => id !== this.ALL_TASKS_ID);
    const clientIds = this.getClientIdsForProjects(filteredProjectIds);


    const trimmedSearch = (searchQuery ?? '').trim();

    return {
      employeeIds: String(this.employeeId),
      statuses: 'processed',
      clientIds: clientIds.length > 0 ? clientIds.join(',') : '',
      projectIds: filteredProjectIds.length > 0 ? filteredProjectIds.join(',') : '',
      phaseIds: filteredPhaseIds.length > 0 ? filteredPhaseIds.join(',') : '',
      taskIds: filteredTaskIds.length > 0 ? filteredTaskIds.join(',') : '',
      startDate: this.toUtcStartOfDayIso(range[0]),
      endDate: this.toUtcEndOfDayIso(range[1]),
      searchQuery: trimmedSearch,
      downloadedBy: this.employeeId,
    };
  }

  private getExportFileName(): string {
    const value = this.exportForm.value as any;
    const range = value.dateRange || [];
    const startLabel = moment(range[0]).format('YYYY-MM-DD');
    const endLabel = moment(range[1]).format('YYYY-MM-DD');
    return `Timesheet Details - ${startLabel} - ${endLabel}.csv`;
  }

  loadDetailsForPreview(searchQuery?: string, advanceToPreviewStep = false) {
    if (!this.exportForm) return;
    this.offcanvasService.dismiss();
    const value = this.exportForm.value as any;
    const range = value.dateRange || [];
    if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) return;

    const payload = this.buildDetailsPayload(searchQuery);
    const fileName = this.getExportFileName();

    this.exportLoading.set(true);
    this.http.postdata('Timesheet/details', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const items: TimesheetDetailItem[] = Array.isArray(res?.data) ? res.data : [];
        const rows = this.toExportRows(items);
        this.exportState.set({ fileName, rows, raw: items });
        this.exportLoading.set(false);
        this.isFilterIndicatorActive = true;
        if (advanceToPreviewStep) {
          this.setStep(2);
        }
      },
      error: (err: any) => {
        this.exportLoading.set(false);
        if (advanceToPreviewStep) {
          this.exportState.set({ fileName, rows: [], raw: [] });
          this.isFilterIndicatorActive = true;
        }
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to load timesheet details');
      }
    });
  }

  private toExportRows(items: TimesheetDetailItem[]): TimesheetExportPreviewRow[] {
    return items.map((item) => {
      const projectCode = item?.projectMeta?.graphData?.code || '';
      const billableText = item.billableStatus || (item.isBillable ? 'Yes' : 'No');
      return {
        timesheetEntryId: item.timesheetEntryId,
        entryDate: item.entryDate,
        clientName: item.clientName,
        projectName: item.projectName,
        projectCode: projectCode,
        phaseName: item.phaseName,
        duration: item.duration,
        description: item.description,
        billable: billableText,
        status: item.status,
        projectMeta: { graphData: { color: item.projectMeta?.graphData?.color || '', code: item.projectMeta?.graphData?.code || '' } },
        clientMeta: { graphData: { color: item.clientMeta?.graphData?.color || '' } },
        phaseMeta: { graphData: { color: item.phaseMeta?.graphData?.color || '' } },
        taskName:item.taskName
      };
    });
  }
 getLighterColor(color: string, amount: number = 0.9): any {
  if (!color) return '#d8d8daff';
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

  exportEntries() {
    this.exporting = true;
    const payload = this.buildDetailsPayload(this.searchTerm());
    this.http.downloadTimesheetReportPost(`Timesheet/details/export`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.exporting = false;
        let filename = this.getExportFileName();
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const utf8Match = contentDisposition.match(/filename\*\=UTF\-8''([^;]+)/);
          const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (utf8Match && utf8Match[1]) {
            filename = decodeURIComponent(utf8Match[1]);
          } else if (asciiMatch && asciiMatch[1]) {
            filename = asciiMatch[1];
          }
        }
        const blob = new Blob([response.body!], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Timesheet exported successfully');
        setTimeout(() => {
          this.navigateToHistoryView();
        }, 1000);
      },
      error: () => {
        this.exporting = false;
        this.conformationPopup.openErrorModal('Failed to export timesheet');
      }
    });
  }

  toggleFilters(content: any) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }
  reset() {
    this.exportStore.reset();
    this.searchValue = '';
    this.searchTerm.set('');
    this.isFilterIndicatorActive = false;
    this.clearFiltersStorage();
    this.setStep(1);
  }

  navigateToHistoryView() {
    this.reset();
    this.router.navigate(['/project-management/timesheet/export-history']);
  }
  setStep(step: number) {
    this.progress = step;
    localStorage.setItem(this.exportStepStorageKey, step.toString());
  }

  nextStep() {
    if (!this.exportForm) return;

    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();
      this.conformationPopup.openErrorModal('Please select a date range');
      return;
    }

    const value = this.exportForm.value as any;
    const range = value.dateRange || [];
    if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) {
      this.conformationPopup.openErrorModal('Please select a date range');
      return;
    }

    this.searchValue = '';
    this.searchTerm.set('');
    this.saveFiltersToStorage();
    this.loadDetailsForPreview('', true);
  }

  prevStep() {
    if (this.progress > 1) {
      this.setStep(this.progress - 1);
    }
  }

  

  private saveFiltersToStorage() {
    if (this.isRestoringFilters) return;
    if (!this.exportForm) return;
    const value = this.exportForm.value as any;
    const range = value.dateRange || [];
    if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) return;
    const filters: TimesheetExportFiltersState = {
      startDate: moment(range[0]).format('YYYY-MM-DD'),
      endDate: moment(range[1]).format('YYYY-MM-DD'),
      projectIds: Array.isArray(value.projectIds) ? value.projectIds : [],
      phaseIds: Array.isArray(value.phaseIds) ? value.phaseIds : [],
      searchQuery: (this.searchTerm() || '').trim(),
      status: "processed",
    };
    localStorage.setItem(this.exportFiltersStorageKey, JSON.stringify(filters));
  }

  private loadFiltersFromStorage(): TimesheetExportFiltersState | null {
    try {
      const raw = localStorage.getItem(this.exportFiltersStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as TimesheetExportFiltersState;
      if (!parsed?.startDate || !parsed?.endDate) return null;
      return {
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        projectIds: Array.isArray(parsed.projectIds) ? parsed.projectIds : [],
        phaseIds: Array.isArray(parsed.phaseIds) ? parsed.phaseIds : [],
        searchQuery: parsed.searchQuery ?? '',
        status: parsed.status ?? 'processed',
      };
    } catch {
      return null;
    }
  }

  private clearFiltersStorage() {
    localStorage.removeItem(this.exportFiltersStorageKey);
  }
  getTaskType() {
    this.http.getData('TaskType').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.taskType = res;
        this.buildTaskOptions();
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  buildTaskOptions() {
    this.exportTaskOptions = (this.taskType || []).map((t: any) => ({
      label: t.taskTypeName,
      value: t.id
    }));
    if (this.exportTaskOptions.length > 0) {
      this.exportTaskOptions.unshift({ label: 'All Tasks', value: this.ALL_TASKS_ID });
    }
    const allTaskIds = this.exportTaskOptions.map(o => o.value);
    this.exportForm.patchValue({ taskIds: allTaskIds }, { emitEvent: false });
    this.previousTaskSelection = allTaskIds;
    this.selectedTasksLabel = 'All Tasks';
    this.maxSelectedTasksLabels = 0;
  }

  onTaskSelectionChange(event: any) {
    const currentSelection = event.value as number[];
    const allTasksId = this.ALL_TASKS_ID;
    const allOptionSelected = currentSelection.includes(allTasksId);
    const wasAllSelected = this.previousTaskSelection.includes(allTasksId);

    let newSelection = [...currentSelection];
    const allOptionValues = this.exportTaskOptions.map(o => o.value);

    if (allOptionSelected && !wasAllSelected) {
      newSelection = allOptionValues;
    } else if (!allOptionSelected && wasAllSelected) {
      const removed = this.previousTaskSelection.filter(x => !currentSelection.includes(x));
      if (removed.includes(allTasksId) && removed.length === 1) {
        newSelection = [];
      } else if (allOptionSelected) {
        newSelection = newSelection.filter(id => id !== allTasksId);
      }
    } else {
      const realItems = allOptionValues.filter(v => v !== allTasksId);
      const selectedRealItems = newSelection.filter(v => v !== allTasksId);
      if (selectedRealItems.length === realItems.length) {
        if (!newSelection.includes(allTasksId)) newSelection.push(allTasksId);
      } else {
        newSelection = newSelection.filter(id => id !== allTasksId);
      }
    }

    if (JSON.stringify(newSelection.sort()) !== JSON.stringify(currentSelection.sort())) {
      this.exportForm.get('taskIds')?.patchValue(newSelection, { emitEvent: false });
      this.previousTaskSelection = newSelection;
    } else {
      this.previousTaskSelection = currentSelection;
    }

    this.updateTasksLabel(newSelection);
  }

  private updateTasksLabel(selection: number[]) {
    const allId = this.ALL_TASKS_ID;
    const allOptionValues = this.exportTaskOptions.map(o => o.value);
    const normalized = this.normalizeAllSelection(selection, allOptionValues, allId);
    const selectedRealItems = normalized.filter(v => v !== allId);
    const realItems = allOptionValues.filter(v => v !== allId);
    const isAllSelected = realItems.length > 0 && selectedRealItems.length === realItems.length;

    if (isAllSelected) {
      this.selectedTasksLabel = 'All Tasks';
      this.maxSelectedTasksLabels = 0;
    } else {
      this.selectedTasksLabel = '{0} items selected';
      this.maxSelectedTasksLabels = 2;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

