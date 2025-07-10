import { TestBed } from '@angular/core/testing';

import { TimeoffYearFilterService } from './timeoff-year-filter.service';

describe('TimeoffYearFilterService', () => {
  let service: TimeoffYearFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeoffYearFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
