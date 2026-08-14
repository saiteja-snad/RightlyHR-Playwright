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

export function unwrapListResponse(items: unknown): unknown[] {
  if (Array.isArray(items)) {
    return items;
  }

  if (!items || typeof items !== 'object') {
    return [];
  }

  const record = items as Record<string, unknown>;
  if (Array.isArray(record['$values'])) {
    return record['$values'];
  }

  for (const key of ['data', 'items', 'result', 'records', 'leavePolicies']) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

export function toArray<T>(items: unknown): T[] {
  return unwrapListResponse(items) as T[];
}
