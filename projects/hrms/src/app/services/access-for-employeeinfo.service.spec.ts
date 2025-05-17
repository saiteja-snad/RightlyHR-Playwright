import { TestBed } from '@angular/core/testing';

import { AccessForEmployeeinfoService } from './access-for-employeeinfo.service';

describe('AccessForEmployeeinfoService', () => {
  let service: AccessForEmployeeinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessForEmployeeinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
