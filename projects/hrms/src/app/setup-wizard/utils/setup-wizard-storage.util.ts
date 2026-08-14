export const SETUP_WIZARD_STORAGE_PREFIX = 'setupWizardProgress_';

/** Removes legacy client-side progress keys from older builds. */
export function clearLegacySetupWizardProgress(): void {
  const keysToRemove: string[] = [];

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key?.startsWith(SETUP_WIZARD_STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}
