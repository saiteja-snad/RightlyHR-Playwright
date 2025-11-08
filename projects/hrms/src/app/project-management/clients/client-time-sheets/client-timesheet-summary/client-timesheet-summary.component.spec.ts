import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTimesheetSummaryComponent } from './client-timesheet-summary.component';

describe('ClientTimesheetSummaryComponent', () => {
  let component: ClientTimesheetSummaryComponent;
  let fixture: ComponentFixture<ClientTimesheetSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTimesheetSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTimesheetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
