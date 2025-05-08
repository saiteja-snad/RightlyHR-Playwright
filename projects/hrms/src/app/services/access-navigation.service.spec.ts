import { TestBed } from '@angular/core/testing';

import { AccessNavigationService } from './access-navigation.service';

describe('AccessNavigationService', () => {
  let service: AccessNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
