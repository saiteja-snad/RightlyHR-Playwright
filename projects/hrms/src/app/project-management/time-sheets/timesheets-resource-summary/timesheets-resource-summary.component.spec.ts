import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsResourceSummaryComponent } from './timesheets-resource-summary.component';

describe('TimesheetsResourceSummaryComponent', () => {
  let component: TimesheetsResourceSummaryComponent;
  let fixture: ComponentFixture<TimesheetsResourceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetsResourceSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetsResourceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
