export interface PolicyVisibilityTarget {
  moduleKey: string;
  subModuleKey?: string;
  enabled: boolean;
}

export interface ApplicablePoliciesContext {
  moduleKey: string;
  subModuleKey?: string;
}

export interface ApplicablePolicyItem {
  id: number;
  policyName: string;
  policyDescription?: string;
  policyAttachment?: string;
  requiresAcknowledgment?: boolean;
  acknowledged?: boolean;
  sendNotification?: boolean;
  visibilityTargets?: PolicyVisibilityTarget[];
  [key: string]: any;
}

