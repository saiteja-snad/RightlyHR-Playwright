import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from '../../services/http.service';
import { SETUP_MODULES } from '../models/setup-wizard.constants';
import { SetupWizardSectionKey } from '../models/setup-wizard.model';
import { toArray, normalizeStatus } from '../utils/setup-wizard-status-filter.util';

export interface SetupWizardStepValidationResult {
  valid: boolean;
  missingLabels: string[];
}

interface SectionCheckResult {
  valid: boolean;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class SetupWizardStepValidationService {
  private readonly http = inject(HttpService);

  validateModule(moduleRoute: string): Observable<SetupWizardStepValidationResult> {
    if (moduleRoute === 'employee-config' || moduleRoute === 'org-hierarchy' || moduleRoute === 'leaves') {
      return of({ valid: true, missingLabels: [] });
    }

    const module = SETUP_MODULES.find(item => item.route === moduleRoute);
    if (!module) {
      return of({ valid: true, missingLabels: [] });
    }

    const checks: Observable<SectionCheckResult>[] = [];

    for (const accordion of module.accordions) {
      if (accordion.optional) {
        continue;
      }

      for (const section of accordion.sections) {
        checks.push(
          this.validateSection(section as SetupWizardSectionKey, accordion.label)
        );
      }
    }

    if (checks.length === 0) {
      return of({ valid: true, missingLabels: [] });
    }

    return forkJoin(checks).pipe(
      map(results => {
        const missingLabels = results.filter(result => !result.valid).map(result => result.label);
        return {
          valid: missingLabels.length === 0,
          missingLabels
        };
      })
    );
  }

  private validateSection(
    section: SetupWizardSectionKey,
    label: string
  ): Observable<SectionCheckResult> {
    switch (section) {
      case 'location':
        return this.hasArrayData('JobLocation/GetJobLocations', label);
      case 'sub-location':
        return this.hasArrayData('SubLocation/GetLocationNames', label);
      case 'shifts':
        return this.hasArrayData('orgShifts', label);
      case 'holidays':
        return this.hasArrayData('orgHolidays', label);
      case 'weekends':
        return this.hasArrayData('OrgWeekendHeader/getAll', label);
      case 'department':
        return this.hasArrayData('Department', label);
      case 'team':
        return this.hasTeamData(label);
      case 'employee-creation':
        return this.hasProspectiveEmployees(label);
      case 'org-hierarchy':
        return this.hasOrgEmployees(label);
      case 'leave-category':
        return this.hasLeaveCategoryRecords(label);
      case 'leave-allocation':
        return this.hasLeaveAllocationRecords(label);
      case 'signature-authority':
        return this.hasArrayData('SignaturesList', label);
      default:
        return of({ valid: true, label });
    }
  }

  private hasLeaveCategoryRecords(label: string): Observable<SectionCheckResult> {
    return this.http.getData('OrgLeavesCategories').pipe(
      map(data => {
        const items = toArray<{ status?: string }>(data);
        const valid = items.some(item => {
          const status = normalizeStatus(item?.status);
          return status === 'published' || status === 'pending for submission';
        });
        return { valid, label };
      }),
      catchError(() => of({ valid: false, label }))
    );
  }

  private hasLeaveAllocationRecords(label: string): Observable<SectionCheckResult> {
    return this.http.getData('LeavePolicy/getall').pipe(
      map(data => ({
        valid: toArray(data).length > 0,
        label
      })),
      catchError(() => of({ valid: false, label }))
    );
  }

  private hasArrayData(url: string, label: string): Observable<SectionCheckResult> {
    return this.http.getData(url).pipe(
      map(data => ({
        valid: toArray(data).length > 0,
        label
      })),
      catchError(() => of({ valid: false, label }))
    );
  }

  private hasTeamData(label: string): Observable<SectionCheckResult> {
    return this.http.getDatabyid('Subdepartments/Getalldept').pipe(
      map((data: unknown) => {
        const teams = toArray<{ isdeleted?: boolean }>(data).filter(team => !team?.isdeleted);
        return { valid: teams.length > 0, label };
      }),
      catchError(() => of({ valid: false, label }))
    );
  }

  private hasProspectiveEmployees(label: string): Observable<SectionCheckResult> {
    return this.http.getData('Employeedata/v3/Getallemployees?statuses=Prospective').pipe(
      map(data => ({
        valid: toArray(data).length > 0,
        label
      })),
      catchError(() => of({ valid: false, label }))
    );
  }

  private hasOrgEmployees(label: string): Observable<SectionCheckResult> {
    const statuses = encodeURIComponent('Prospective,Active,Trainee Active,Active Contract');
    return this.http.getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`).pipe(
      map(data => ({
        valid: toArray(data).length > 0,
        label
      })),
      catchError(() => of({ valid: false, label }))
    );
  }
}
