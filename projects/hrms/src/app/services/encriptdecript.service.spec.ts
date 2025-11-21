import { TestBed } from '@angular/core/testing';

import { EncriptdecriptService } from './encriptdecript.service';

describe('EncriptdecriptService', () => {
  let service: EncriptdecriptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncriptdecriptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
