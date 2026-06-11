import { Injectable } from '@angular/core';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';
import { HttpService } from '../../services/http.service';
import {
  PolicyVisibilityModuleOption,
  PolicyVisibilitySubModuleOption,
  normalizePolicyVisibilityKey
} from './policy-visibility.catalog';

@Injectable({
  providedIn: 'root'
})
export class PolicyVisibilityOptionsService {
  private modules$?: Observable<PolicyVisibilityModuleOption[]>;
  private subModulesCache = new Map<string, Observable<PolicyVisibilitySubModuleOption[]>>();

  constructor(private http: HttpService) {}

  getModules(): Observable<PolicyVisibilityModuleOption[]> {
    if (!this.modules$) {
      this.modules$ = this.http.getData('entityAttributeValues?entity=Module&attribute=Menu').pipe(
        map((response: any) =>
          (Array.isArray(response) ? response : [])
            .map((item: any) => ({
              id: item?.id,
              key: normalizePolicyVisibilityKey(item?.value),
              label: String(item?.value ?? '').trim(),
              sourceValue: String(item?.value ?? '').trim(),
              subModules: []
            }))
            .filter((item: PolicyVisibilityModuleOption) => !!item.key && !!item.label)
            .sort((a, b) => a.label.localeCompare(b.label))
        ),
        shareReplay(1)
      );
    }

    return this.modules$;
  }

  getSubModules(moduleKey: string | null | undefined): Observable<PolicyVisibilitySubModuleOption[]> {
    const normalizedKey = normalizePolicyVisibilityKey(moduleKey);
    if (!normalizedKey) {
      return of([]);
    }

    if (!this.subModulesCache.has(normalizedKey)) {
      const request$ = this.getModules().pipe(
        switchMap((modules) => {
          const moduleOption = modules.find((item) => item.key === normalizedKey);
          if (!moduleOption?.sourceValue) {
            return of([]);
          }

          const encodedAttribute = encodeURIComponent(moduleOption.sourceValue);
          return this.http.getData(`entityAttributeValues?entity=Menu&attribute=${encodedAttribute}`).pipe(
            map((response: any) =>
              (Array.isArray(response) ? response : [])
                .map((item: any) => ({
                  id: item?.id,
                  key: normalizePolicyVisibilityKey(item?.value),
                  label: String(item?.value ?? '').trim(),
                  sourceValue: String(item?.value ?? '').trim()
                }))
                .filter((item: PolicyVisibilitySubModuleOption) => !!item.key && !!item.label)
                .sort((a, b) => a.label.localeCompare(b.label))
            )
          );
        }),
        shareReplay(1)
      );

      this.subModulesCache.set(normalizedKey, request$);
    }

    return this.subModulesCache.get(normalizedKey)!;
  }
}

