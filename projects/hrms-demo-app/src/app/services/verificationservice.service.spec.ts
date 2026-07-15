import { TestBed } from '@angular/core/testing';

import { VerificationserviceService } from './verificationservice.service';

describe('VerificationserviceService', () => {
  let service: VerificationserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerificationserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
