import { SetupWizardProgressDto } from '../models/setup-wizard-progress.model';

export const SETUP_WIZARD_STORAGE_PREFIX = 'setupWizardProgress_';

export function getSetupWizardStorageKey(employeeId?: number | string | null): string {
  return `${SETUP_WIZARD_STORAGE_PREFIX}${employeeId ?? 'anonymous'}`;
}

export function collectSetupWizardProgressEntries(): [string, string][] {
  const entries: [string, string][] = [];

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(SETUP_WIZARD_STORAGE_PREFIX)) {
      continue;
    }

    const value = localStorage.getItem(key);
    if (value) {
      entries.push([key, value]);
    }
  }

  return entries;
}

export function restoreSetupWizardProgressEntries(entries: [string, string][]): void {
  entries.forEach(([key, value]) => localStorage.setItem(key, value));
}

export function readSetupWizardProgressFromStorage(
  employeeId?: number | string | null
): SetupWizardProgressDto | null {
  const raw = localStorage.getItem(getSetupWizardStorageKey(employeeId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SetupWizardProgressDto;
  } catch {
    return null;
  }
}

export function writeSetupWizardProgressToStorage(
  progress: SetupWizardProgressDto,
  employeeId?: number | string | null
): void {
  localStorage.setItem(getSetupWizardStorageKey(employeeId), JSON.stringify(progress));
}

export function clearSetupWizardProgress(employeeId?: number | string | null): void {
  localStorage.removeItem(getSetupWizardStorageKey(employeeId));
}

export function clearAllSetupWizardProgress(): void {
  const keysToRemove: string[] = [];

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key?.startsWith(SETUP_WIZARD_STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function getCurrentEmployeeId(): number | null {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = user?.employeeId ?? user?.EmployeeId;
    return employeeId ? Number(employeeId) : null;
  } catch {
    return null;
  }
}
