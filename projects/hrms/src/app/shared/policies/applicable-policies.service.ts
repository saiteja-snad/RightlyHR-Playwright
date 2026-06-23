import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ApplicablePoliciesContext, ApplicablePolicyItem, PolicyVisibilityTarget } from './applicable-policies.models';
import { normalizePolicyVisibilityKey } from './policy-visibility.catalog';
import { PolicyVisibilityOptionsService } from './policy-visibility-options.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicablePoliciesService {
  private readonly jobDetailsCache = new Map<number, Observable<any>>();

  constructor(
    private http: HttpService,
    private sanitizer: DomSanitizer,
    private policyVisibilityOptionsService: PolicyVisibilityOptionsService
  ) {}

  getApplicablePolicies(context: ApplicablePoliciesContext): Observable<ApplicablePolicyItem[]> {
    const loggedInEmployeeId = this.getLoggedInEmployeeId();
    const currentYear = new Date().getFullYear();
    const normalizedModuleKey = normalizePolicyVisibilityKey(context?.moduleKey);
    const normalizedSubModuleKey = normalizePolicyVisibilityKey(context?.subModuleKey);

    if (!loggedInEmployeeId || !normalizedModuleKey) {
      return of([]);
    }

    return this.getEmployeeJobDetails(loggedInEmployeeId).pipe(
      switchMap((jobDetails: any[]) => {
        const job = jobDetails?.[0];
        if (!job) {
          return of([]);
        }

        const baseQuery: any = {
          locationId: job.locationid,
          subLocationId: job.sublocationid,
          shiftId: job.shiftId,
          Applicableyear: currentYear,
          employeeId: loggedInEmployeeId
        };

        return this.resolveApiModuleNames({
          moduleKey: normalizedModuleKey,
          subModuleKey: normalizedSubModuleKey
        }).pipe(
          switchMap((apiContext) => {
            const query: any = { ...baseQuery };
            if (apiContext.moduleName) {
              query.module = apiContext.moduleName;
            }
            if (apiContext.subModuleName) {
              query.subModule = apiContext.subModuleName;
            }

            return this.http.getDataWithQueryParams('v2/orgPolicies/getpolicybylocation', query).pipe(
              map((response: any) => this.extractApplicableItems(response, {
                moduleKey: normalizedModuleKey,
                subModuleKey: normalizedSubModuleKey
              }))
            );
          })
        );
      })
    );
  }

  acknowledgePolicy(orgPolicyItemId: number, employeeId: number): Observable<any> {
    return this.http.postdata('OrgPolicyAcknowledgment', {
      orgPolicyItemId,
      employeeId,
      acknowledged: true,
      acknowledgedDate: new Date(),
      source: 'Web'
    });
  }

  downloadPolicyAttachment(attachmentPath: string): Observable<Blob> {
    return this.http.DownloadDataWithQuery('FileSystem/Downloadfile', attachmentPath).pipe(
      map((response: any) => response.body as Blob)
    );
  }

  createSafeImageUrl(objectUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  }

  saveAttachment(blob: Blob, fileName: string): void {
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  private getEmployeeJobDetails(employeeId: number): Observable<any> {
    if (!this.jobDetailsCache.has(employeeId)) {
      const request$ = this.http.getData(`JobDetails/${employeeId}`).pipe(shareReplay(1));
      this.jobDetailsCache.set(employeeId, request$);
    }

    return this.jobDetailsCache.get(employeeId)!;
  }

  private extractApplicableItems(response: any, context: ApplicablePoliciesContext): ApplicablePolicyItem[] {
    const orgPolicyItems = Array.isArray(response)
      ? response.flatMap((policy: any) => policy?.orgPolicyItems ?? [])
      : [];

    const normalizedItems = orgPolicyItems
      .map((item: any) => ({
        ...item,
        visibilityTargets: this.normalizeVisibilityTargets(item)
      }))
      .sort((a: ApplicablePolicyItem, b: ApplicablePolicyItem) =>
        (a.policyName ?? '').localeCompare(b.policyName ?? '')
      );

    const hasMappedTargets = normalizedItems.some((item) => (item.visibilityTargets?.length ?? 0) > 0);

    if (!hasMappedTargets) {
      return normalizedItems;
    }

    return normalizedItems
      .filter((item: ApplicablePolicyItem) =>
        (item.visibilityTargets ?? []).some(
          (target) =>
            target.enabled &&
            normalizePolicyVisibilityKey(target.moduleKey) === normalizePolicyVisibilityKey(context.moduleKey) &&
            (
              !normalizePolicyVisibilityKey(context.subModuleKey) ||
              normalizePolicyVisibilityKey(target.subModuleKey) === normalizePolicyVisibilityKey(context.subModuleKey)
            )
        )
      )
      .sort((a: ApplicablePolicyItem, b: ApplicablePolicyItem) =>
        (a.policyName ?? '').localeCompare(b.policyName ?? '')
      );
  }

  private getLoggedInEmployeeId(): number | null {
    const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = Number(user?.employeeId);
    return Number.isFinite(employeeId) && employeeId > 0 ? employeeId : null;
  }

  private normalizeVisibilityTargets(item: any): PolicyVisibilityTarget[] {
    const rawModuleMappings = item?.moduleMappings ?? item?.policyModuleMappings ?? [];
    if (Array.isArray(rawModuleMappings) && rawModuleMappings.length > 0) {
      return rawModuleMappings
        .map((m: any) => ({
          moduleKey: normalizePolicyVisibilityKey(m?.moduleName),
          subModuleKey: normalizePolicyVisibilityKey(m?.subModuleName),
          enabled: m?.isVisible === true
        }))
        .filter((t: PolicyVisibilityTarget) => !!t.moduleKey);
    }

    const rawTargets =
      item?.visibilityTargets ??
      item?.policyVisibilityTargets ??
      item?.visibilityMappings ??
      item?.moduleVisibilityMappings ??
      [];

    if (!Array.isArray(rawTargets)) {
      return [];
    }

    return rawTargets.flatMap((target: any) => {
      const moduleKey = String(target?.moduleKey ?? '').trim();

      if (Array.isArray(target?.subModuleKeys)) {
        return target.subModuleKeys
          .map((subModuleKey: string) => String(subModuleKey ?? '').trim())
          .filter(Boolean)
          .map((subModuleKey: string) => ({
            moduleKey: normalizePolicyVisibilityKey(moduleKey),
            subModuleKey: normalizePolicyVisibilityKey(subModuleKey),
            enabled: target?.enabled === true || target?.displayEnabled === true
          }));
      }

      const subModuleKey = String(target?.subModuleKey ?? '').trim();
      if (!moduleKey) {
        return [];
      }

      return [{
        moduleKey: normalizePolicyVisibilityKey(moduleKey),
        subModuleKey: normalizePolicyVisibilityKey(subModuleKey),
        enabled: target?.enabled === true || target?.displayEnabled === true
      }];
    });
  }

  private resolveApiModuleNames(context: ApplicablePoliciesContext): Observable<{ moduleName: string; subModuleName: string }> {
    const moduleKey = normalizePolicyVisibilityKey(context?.moduleKey);
    const subModuleKey = normalizePolicyVisibilityKey(context?.subModuleKey);

    if (!moduleKey) {
      return of({ moduleName: '', subModuleName: '' });
    }

    return this.policyVisibilityOptionsService.getModules().pipe(
      switchMap((modules) => {
        const moduleName = modules.find((m) => m.key === moduleKey)?.label ?? '';
        if (!moduleName) {
          return of({ moduleName: '', subModuleName: '' });
        }

        if (!subModuleKey) {
          return of({ moduleName, subModuleName: '' });
        }

        return this.policyVisibilityOptionsService.getSubModules(moduleKey).pipe(
          map((subModules) => {
            const subModuleName = subModules.find((s) => s.key === subModuleKey)?.label ?? '';
            return {
              moduleName,
              subModuleName
            };
          })
        );
      })
    );
  }
}
