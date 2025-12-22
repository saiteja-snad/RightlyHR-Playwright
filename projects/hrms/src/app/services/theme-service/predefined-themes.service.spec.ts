import { TestBed } from '@angular/core/testing';

import { PredefinedThemesService } from './predefined-themes.service';

describe('PredefinedThemesService', () => {
  let service: PredefinedThemesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredefinedThemesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
