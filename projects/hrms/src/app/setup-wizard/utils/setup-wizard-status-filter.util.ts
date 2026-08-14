export function normalizeStatus(status: unknown): string {
  return String(status ?? '').trim().toLowerCase();
}

export function matchesStatus(itemStatus: unknown, expectedStatus: string): boolean {
  return normalizeStatus(itemStatus) === normalizeStatus(expectedStatus);
}

export function filterItemsByStatus<T extends { status?: unknown }>(
  items: unknown,
  expectedStatus: string
): T[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(item => matchesStatus(item?.status, expectedStatus));
}

export function toArray<T>(items: unknown): T[] {
  return Array.isArray(items) ? items : [];
}
