import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicablePolicyViewerComponent } from '../applicable-policy-viewer/applicable-policy-viewer.component';
import { ApplicablePoliciesContext, ApplicablePolicyItem } from '../applicable-policies.models';
import { ApplicablePoliciesService } from '../applicable-policies.service';

@Component({
  selector: 'app-applicable-policies-trigger',
  imports: [CommonModule, NgbDropdownModule, TranslateModule, ApplicablePolicyViewerComponent],
  templateUrl: './applicable-policies-trigger.component.html',
  styleUrl: './applicable-policies-trigger.component.scss'
})
export class ApplicablePoliciesTriggerComponent implements OnChanges, OnDestroy {
  @Input() moduleKey = '';
  @Input() subModuleKey = '';
  @Input() buttonLabel = 'Applicable Policies';
  @Input() hideWhenEmpty = true;
  @ViewChild(ApplicablePolicyViewerComponent) viewer!: ApplicablePolicyViewerComponent;

  loading = false;
  policies: ApplicablePolicyItem[] = [];
  hasLoaded = false;
  shouldRender = true;
  private readonly destroy$ = new Subject<void>();

  constructor(private applicablePoliciesService: ApplicablePoliciesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moduleKey'] || changes['subModuleKey']) {
      this.hasLoaded = false;
      this.policies = [];
      if (this.hideWhenEmpty) {
        this.checkVisibility();
      } else {
        this.shouldRender = true;
      }
    }
  }

  loadPolicies(): void {
    const context = this.buildContext();
    if (!context || this.loading || (this.hasLoaded && this.policies.length > 0)) {
      return;
    }

    this.loading = true;
    this.applicablePoliciesService.getApplicablePolicies(context)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (policies) => {
          this.policies = policies;
          this.hasLoaded = true;
          if (this.hideWhenEmpty) {
            this.shouldRender = this.policies.length > 0;
          }
          this.loading = false;
        },
        error: () => {
          this.policies = [];
          this.hasLoaded = true;
          if (this.hideWhenEmpty) {
            this.shouldRender = false;
          }
          this.loading = false;
        }
      });
  }

  openPolicy(policy: ApplicablePolicyItem): void {
    if (!policy) {
      return;
    }

    this.viewer.open(policy);
  }

  onPolicyAcknowledged(policyId: number): void {
    this.policies = this.policies.map((policy) =>
      policy.id === policyId ? { ...policy, acknowledged: true } : policy
    );
  }

  get isDisabled(): boolean {
    return !this.moduleKey;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildContext(): ApplicablePoliciesContext | null {
    if (this.isDisabled) {
      return null;
    }

    return {
      moduleKey: this.moduleKey,
      subModuleKey: this.subModuleKey
    };
  }

  private checkVisibility(): void {
    const context = this.buildContext();
    if (!context) {
      this.shouldRender = false;
      return;
    }

    this.shouldRender = false;
    this.loading = true;
    this.applicablePoliciesService.getApplicablePolicies(context)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (policies) => {
          this.policies = policies;
          this.hasLoaded = true;
          this.shouldRender = this.policies.length > 0;
          this.loading = false;
        },
        error: () => {
          this.policies = [];
          this.hasLoaded = true;
          this.shouldRender = false;
          this.loading = false;
        }
      });
  }
}
