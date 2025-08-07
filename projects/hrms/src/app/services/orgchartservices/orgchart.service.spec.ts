import { TestBed } from '@angular/core/testing';

import { OrgchartService } from './orgchart.service';

describe('OrgchartService', () => {
  let service: OrgchartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgchartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
